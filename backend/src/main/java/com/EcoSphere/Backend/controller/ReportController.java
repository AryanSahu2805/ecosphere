package com.EcoSphere.Backend.controller;

import com.EcoSphere.Backend.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/emissions-summary/csv")
    public ResponseEntity<byte[]> getEmissionsSummaryCsv(
            @RequestParam Long organizationId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        byte[] csv = reportService.generateEmissionsSummaryCsv(organizationId, from, to);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"emissions-summary-" + organizationId + "-" + from + "-" + to + ".csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .contentLength(csv.length)
                .body(csv);
    }

    @GetMapping("/energy-records/csv")
    public ResponseEntity<byte[]> getEnergyRecordsCsv(
            @RequestParam Long organizationId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        byte[] csv = reportService.generateEnergyRecordsCsv(organizationId, from, to);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"energy-records-" + organizationId + "-" + from + "-" + to + ".csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .contentLength(csv.length)
                .body(csv);
    }

    @GetMapping("/emissions-summary/pdf")
    public ResponseEntity<byte[]> getEmissionsSummaryPdf(
            @RequestParam Long organizationId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        byte[] pdf = reportService.generateEmissionsSummaryPdf(organizationId, from, to);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"emissions-report-" + organizationId + "-" + from + "-" + to + ".pdf\"")
                .contentType(MediaType.parseMediaType("application/pdf"))
                .contentLength(pdf.length)
                .body(pdf);
    }
}
