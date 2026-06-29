package com.EcoSphere.Backend.service;

import com.EcoSphere.Backend.dto.EmissionsSummaryDTO;
import com.EcoSphere.Backend.dto.MonthlyTrendDTO;
import com.EcoSphere.Backend.exception.ResourceNotFoundException;
import com.EcoSphere.Backend.model.EnergyRecord;
import com.EcoSphere.Backend.repository.DepartmentRepository;
import com.EcoSphere.Backend.repository.EnergyRecordRepository;
import com.EcoSphere.Backend.repository.LocationRepository;
import com.EcoSphere.Backend.repository.OrganizationRepository;
import com.EcoSphere.Backend.repository.ServerUsageRecordRepository;
import com.EcoSphere.Backend.repository.TravelRecordRepository;
import com.lowagie.text.Chunk;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReportService {

    private static final Color HEADER_BG = new Color(220, 220, 220);

    private final OrganizationRepository organizationRepository;
    private final LocationRepository locationRepository;
    private final DepartmentRepository departmentRepository;
    private final EnergyRecordRepository energyRecordRepository;
    private final TravelRecordRepository travelRecordRepository;
    private final ServerUsageRecordRepository serverUsageRecordRepository;
    private final AnalyticsService analyticsService;
    private final AuditLogService auditLogService;

    public byte[] generateEmissionsSummaryCsv(Long organizationId, LocalDate from, LocalDate to) {
        if (!organizationRepository.existsById(organizationId)) {
            throw new ResourceNotFoundException("Organization not found: " + organizationId);
        }

        EmissionsSummaryDTO summary = analyticsService.getEmissionsSummary(organizationId, from, to);
        String orgName = organizationRepository.findById(organizationId).get().getName();

        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try (Writer writer = new OutputStreamWriter(out)) {
            CSVFormat format = CSVFormat.DEFAULT.builder()
                    .setHeader("Field", "Value")
                    .build();

            try (CSVPrinter printer = new CSVPrinter(writer, format)) {
                printer.printRecord("Organization", orgName);
                printer.printRecord("Report Period", from + " to " + to);
                printer.printRecord("Generated At", LocalDateTime.now());
                printer.printRecord("", "");
                printer.printRecord("EMISSIONS SUMMARY", "");
                printer.printRecord("Total Energy Emissions (kg CO2)", summary.getTotalEnergyEmissions());
                printer.printRecord("Total Travel Emissions (kg CO2)", summary.getTotalTravelEmissions());
                printer.printRecord("Total Server Emissions (kg CO2)", summary.getTotalServerEmissions());
                printer.printRecord("Total Emissions (kg CO2)", summary.getTotalEmissions());
                printer.printRecord("", "");
                printer.printRecord("RECORD COUNTS", "");
                printer.printRecord("Energy Records", summary.getEnergyRecordCount());
                printer.printRecord("Travel Records", summary.getTravelRecordCount());
                printer.printRecord("Server Records", summary.getServerRecordCount());
                writer.flush();
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate CSV report", e);
        }

        auditLogService.log("EXPORT", "REPORT", null,
                "CSV emissions summary for org " + organizationId + " from " + from + " to " + to);

        return out.toByteArray();
    }

    public byte[] generateEnergyRecordsCsv(Long organizationId, LocalDate from, LocalDate to) {
        if (!organizationRepository.existsById(organizationId)) {
            throw new ResourceNotFoundException("Organization not found: " + organizationId);
        }

        List<Long> departmentIds = getDepartmentIds(organizationId);

        List<EnergyRecord> records = departmentIds.isEmpty() ? List.of() :
                departmentIds.stream()
                        .flatMap(deptId -> energyRecordRepository
                                .findByDepartmentIdAndRecordedDateBetween(deptId, from, to).stream())
                        .sorted(Comparator.comparing(EnergyRecord::getRecordedDate))
                        .toList();

        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try (Writer writer = new OutputStreamWriter(out)) {
            CSVFormat format = CSVFormat.DEFAULT.builder()
                    .setHeader("ID", "Department ID", "Energy Type", "Consumption (kWh)",
                            "CO2 Emission (kg)", "Recorded Date", "Notes")
                    .build();

            try (CSVPrinter printer = new CSVPrinter(writer, format)) {
                for (EnergyRecord record : records) {
                    printer.printRecord(
                            record.getId(),
                            record.getDepartmentId(),
                            record.getEnergyType(),
                            record.getConsumptionKwh(),
                            record.getCo2Emission(),
                            record.getRecordedDate(),
                            record.getNotes());
                }
                writer.flush();
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate CSV report", e);
        }

        auditLogService.log("EXPORT", "ENERGY_RECORD", null,
                "CSV export " + records.size() + " records for org " + organizationId);

        return out.toByteArray();
    }

    public byte[] generateEmissionsSummaryPdf(Long organizationId, LocalDate from, LocalDate to) {
        if (!organizationRepository.existsById(organizationId)) {
            throw new ResourceNotFoundException("Organization not found: " + organizationId);
        }

        String orgName = organizationRepository.findById(organizationId).get().getName();
        EmissionsSummaryDTO summary = analyticsService.getEmissionsSummary(organizationId, from, to);
        List<MonthlyTrendDTO> monthlyTrends = analyticsService.getMonthlyTrends(organizationId, LocalDate.now().getYear());

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4);

        try {
            PdfWriter.getInstance(doc, out);
            doc.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20, Color.DARK_GRAY);
            Font headingFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13, Color.DARK_GRAY);
            Font smallFont = FontFactory.getFont(FontFactory.HELVETICA, 9, new Color(100, 100, 100));

            Paragraph title = new Paragraph("EcoSphere — Emissions Summary Report", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(8);
            doc.add(title);

            Paragraph subtitle = new Paragraph(orgName + " | " + from + " to " + to, smallFont);
            subtitle.setAlignment(Element.ALIGN_CENTER);
            subtitle.setSpacingAfter(4);
            doc.add(subtitle);

            Paragraph generated = new Paragraph(
                    "Generated: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd MMM yyyy HH:mm")),
                    smallFont);
            generated.setAlignment(Element.ALIGN_CENTER);
            generated.setSpacingAfter(20);
            doc.add(generated);

            doc.add(new Paragraph("Emissions Summary", headingFont));
            doc.add(Chunk.NEWLINE);

            PdfPTable summaryTable = new PdfPTable(2);
            summaryTable.setWidthPercentage(100);
            summaryTable.setSpacingAfter(20);

            addTableRow(summaryTable, "Category", "CO2 Emissions (kg)", true);
            addTableRow(summaryTable, "Energy", summary.getTotalEnergyEmissions().toPlainString(), false);
            addTableRow(summaryTable, "Travel", summary.getTotalTravelEmissions().toPlainString(), false);
            addTableRow(summaryTable, "Server Usage", summary.getTotalServerEmissions().toPlainString(), false);
            addTableRow(summaryTable, "TOTAL", summary.getTotalEmissions().toPlainString(), true);

            doc.add(summaryTable);

            doc.add(new Paragraph("Record Counts", headingFont));
            doc.add(Chunk.NEWLINE);

            PdfPTable countTable = new PdfPTable(2);
            countTable.setWidthPercentage(60);
            countTable.setSpacingAfter(20);
            addTableRow(countTable, "Record Type", "Count", true);
            addTableRow(countTable, "Energy Records", String.valueOf(summary.getEnergyRecordCount()), false);
            addTableRow(countTable, "Travel Records", String.valueOf(summary.getTravelRecordCount()), false);
            addTableRow(countTable, "Server Usage Records", String.valueOf(summary.getServerRecordCount()), false);
            doc.add(countTable);

            Paragraph footer = new Paragraph(
                    "This report was generated by EcoSphere — Enterprise Carbon Intelligence Platform",
                    smallFont);
            footer.setAlignment(Element.ALIGN_CENTER);
            doc.add(footer);

            doc.close();
        } catch (DocumentException e) {
            throw new RuntimeException("Failed to generate PDF report", e);
        }

        auditLogService.log("EXPORT", "REPORT", null,
                "PDF emissions summary for org " + organizationId);

        return out.toByteArray();
    }

    private void addTableRow(PdfPTable table, String label, String value, boolean isHeader) {
        Font font = isHeader
                ? FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, Color.BLACK)
                : FontFactory.getFont(FontFactory.HELVETICA, 11, Color.BLACK);
        Color background = isHeader ? HEADER_BG : Color.WHITE;

        PdfPCell labelCell = new PdfPCell(new Paragraph(label, font));
        labelCell.setBackgroundColor(background);

        PdfPCell valueCell = new PdfPCell(new Paragraph(value, font));
        valueCell.setBackgroundColor(background);

        table.addCell(labelCell);
        table.addCell(valueCell);
    }

    private List<Long> getDepartmentIds(Long organizationId) {
        List<Long> locationIds = locationRepository.findIdsByOrganizationId(organizationId);
        if (locationIds.isEmpty()) {
            return List.of();
        }

        return departmentRepository.findIdsByLocationIdIn(locationIds);
    }
}
