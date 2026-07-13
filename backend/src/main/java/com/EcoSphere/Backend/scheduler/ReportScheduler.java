package com.EcoSphere.Backend.scheduler;

import com.EcoSphere.Backend.dto.EmissionsSummaryDTO;
import com.EcoSphere.Backend.model.EmailPreferences;
import com.EcoSphere.Backend.model.Organization;
import com.EcoSphere.Backend.model.User;
import com.EcoSphere.Backend.repository.EmailPreferencesRepository;
import com.EcoSphere.Backend.repository.OrganizationRepository;
import com.EcoSphere.Backend.repository.UserRepository;
import com.EcoSphere.Backend.service.AnalyticsService;
import com.EcoSphere.Backend.service.EmailPreferencesService;
import com.EcoSphere.Backend.service.EmailService;
import com.EcoSphere.Backend.service.ReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class ReportScheduler {

    private final EmailPreferencesRepository prefsRepo;
    private final EmailPreferencesService emailPrefService;
    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final ReportService reportService;
    private final AnalyticsService analyticsService;
    private final EmailService emailService;

    @Scheduled(cron = "0 0 8 * * *")
    public void sendScheduledReports() {
        log.info("ReportScheduler: checking report schedules");

        List<EmailPreferences> allPrefs = prefsRepo.findByReportsEnabledTrue();

        for (EmailPreferences prefs : allPrefs) {
            try {
                if (!emailPrefService.shouldSendReportToday(prefs)) continue;

                User user = userRepository.findById(prefs.getUserId()).orElse(null);
                if (user == null) continue;

                List<Organization> orgs = organizationRepository
                        .findByCreatedByUserId(user.getId());

                for (Organization org : orgs) {
                    sendReportForOrg(user, org, prefs);
                }

                prefs.setLastReportSentAt(LocalDateTime.now());
                prefsRepo.save(prefs);

            } catch (Exception e) {
                log.error("Report scheduler error for prefs {}: {}", prefs.getId(), e.getMessage());
            }
        }
    }

    private void sendReportForOrg(User admin, Organization org, EmailPreferences prefs) {
        LocalDate today = LocalDate.now();
        LocalDate from;
        String period;

        switch (prefs.getReportFrequency()) {
            case "DAILY"   -> { from = today.minusDays(1);                     period = "Daily";   }
            case "MONTHLY" -> { from = today.minusMonths(1).withDayOfMonth(1); period = "Monthly"; }
            default        -> { from = today.minusWeeks(1);                     period = "Weekly";  }
        }

        EmissionsSummaryDTO summary;
        try {
            summary = analyticsService.getEmissionsSummaryInternal(org.getId(), from, today);
        } catch (Exception e) {
            log.warn("Could not get summary for org {}: {}", org.getId(), e.getMessage());
            return;
        }

        String summaryText = buildSummaryText(summary, from, today, org.getName());

        byte[] pdfBytes = null;
        byte[] csvBytes = null;
        try {
            pdfBytes = reportService.generateEmissionsSummaryPdf(org.getId(), from, today);
            csvBytes = reportService.generateEmissionsSummaryCsv(org.getId(), from, today);
        } catch (Exception e) {
            log.warn("Report generation failed for org {}: {}", org.getId(), e.getMessage());
        }

        emailService.sendReportEmail(
                admin.getEmail(), admin.getName(), org.getName(),
                period, summaryText, pdfBytes, csvBytes);

        log.info("{} report sent to {} for org {}", period, admin.getEmail(), org.getName());
    }

    private String buildSummaryText(EmissionsSummaryDTO s, LocalDate from, LocalDate to, String orgName) {
        return String.format(
                "Organization: %s\n" +
                "Period: %s to %s\n\n" +
                "Total CO2 Emissions: %.4f kg\n" +
                "  Energy:  %.4f kg\n" +
                "  Travel:  %.4f kg\n" +
                "  Server:  %.4f kg\n\n" +
                "Records logged this period:\n" +
                "  Energy records:  %d\n" +
                "  Travel records:  %d\n" +
                "  Server records:  %d",
                orgName, from, to,
                s.getTotalEmissions(),
                s.getTotalEnergyEmissions(),
                s.getTotalTravelEmissions(),
                s.getTotalServerEmissions(),
                s.getEnergyRecordCount(),
                s.getTravelRecordCount(),
                s.getServerRecordCount());
    }
}
