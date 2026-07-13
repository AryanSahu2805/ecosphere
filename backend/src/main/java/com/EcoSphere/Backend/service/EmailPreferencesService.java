package com.EcoSphere.Backend.service;

import com.EcoSphere.Backend.dto.EmailPreferencesDTO;
import com.EcoSphere.Backend.exception.ResourceNotFoundException;
import com.EcoSphere.Backend.model.EmailPreferences;
import com.EcoSphere.Backend.model.User;
import com.EcoSphere.Backend.repository.EmailPreferencesRepository;
import com.EcoSphere.Backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailPreferencesService {

    private final EmailPreferencesRepository prefsRepo;
    private final UserRepository userRepository;

    public EmailPreferencesDTO getPreferences() {
        User user = getCurrentUser();
        EmailPreferences prefs = prefsRepo.findByUserId(user.getId())
                .orElseGet(() -> createDefaults(user));
        return mapToDTO(prefs);
    }

    public EmailPreferencesDTO updatePreferences(EmailPreferencesDTO dto) {
        User user = getCurrentUser();
        EmailPreferences prefs = prefsRepo.findByUserId(user.getId())
                .orElseGet(() -> createDefaults(user));

        prefs.setAlertLevel(dto.getAlertLevel());
        prefs.setReportFrequency(dto.getReportFrequency());
        prefs.setReportsEnabled(dto.isReportsEnabled());
        prefs.setAlertsEnabled(dto.isAlertsEnabled());

        return mapToDTO(prefsRepo.save(prefs));
    }

    public boolean shouldReceiveAlertEmail(Long userId, String severity) {
        EmailPreferences prefs = prefsRepo.findByUserId(userId).orElse(null);
        if (prefs == null) return true;
        if (!prefs.isAlertsEnabled()) return false;

        return switch (prefs.getAlertLevel()) {
            case "NONE"   -> false;
            case "HIGH"   -> "HIGH".equals(severity);
            case "MEDIUM" -> "HIGH".equals(severity) || "MEDIUM".equals(severity);
            default       -> true;
        };
    }

    public boolean shouldSendReportToday(EmailPreferences prefs) {
        if (!prefs.isReportsEnabled()) return false;
        if ("NONE".equals(prefs.getReportFrequency())) return false;

        LocalDate today = LocalDate.now();
        return switch (prefs.getReportFrequency()) {
            case "DAILY"   -> true;
            case "WEEKLY"  -> today.getDayOfWeek() == DayOfWeek.MONDAY;
            case "MONTHLY" -> today.getDayOfMonth() == 1;
            default        -> false;
        };
    }

    private EmailPreferences createDefaults(User user) {
        Long orgId = user.getOrganizationId() != null ? user.getOrganizationId() : 1L;
        EmailPreferences prefs = EmailPreferences.builder()
                .userId(user.getId())
                .organizationId(orgId)
                .alertLevel("ALL")
                .reportFrequency("WEEKLY")
                .reportsEnabled(true)
                .alertsEnabled(true)
                .build();
        return prefsRepo.save(prefs);
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private EmailPreferencesDTO mapToDTO(EmailPreferences p) {
        return EmailPreferencesDTO.builder()
                .id(p.getId())
                .alertLevel(p.getAlertLevel())
                .reportFrequency(p.getReportFrequency())
                .reportsEnabled(p.isReportsEnabled())
                .alertsEnabled(p.isAlertsEnabled())
                .build();
    }
}
