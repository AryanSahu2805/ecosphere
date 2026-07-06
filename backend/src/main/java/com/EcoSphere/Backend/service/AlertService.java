package com.EcoSphere.Backend.service;

import com.EcoSphere.Backend.dto.AlertResponseDTO;
import com.EcoSphere.Backend.exception.ResourceNotFoundException;
import com.EcoSphere.Backend.model.Alert;
import com.EcoSphere.Backend.model.User;
import com.EcoSphere.Backend.repository.AlertRepository;
import com.EcoSphere.Backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AlertService {

    private final AlertRepository alertRepository;
    private final UserRepository userRepository;
    private final OrganizationService organizationService;

    public void createAlertIfNotExists(Long organizationId, Long goalId, String alertType,
                                        String message, String severity) {
        if (goalId != null && alertRepository.existsByGoalIdAndAlertTypeAndResolved(goalId, alertType, false)) {
            return;
        }

        Alert alert = Alert.builder()
                .organizationId(organizationId)
                .goalId(goalId)
                .alertType(alertType)
                .message(message)
                .severity(severity)
                .resolved(false)
                .resolvedBy(null)
                .resolvedAt(null)
                .build();

        alertRepository.save(alert);
    }

    public List<AlertResponseDTO> getAlertsByOrganization(Long organizationId) {
        organizationService.verifyAccessToOrganization(organizationId);
        return alertRepository.findByOrganizationIdOrderByCreatedAtDesc(organizationId).stream()
                .map(this::mapToDTO)
                .toList();
    }

    public List<AlertResponseDTO> getUnresolvedAlerts(Long organizationId) {
        organizationService.verifyAccessToOrganization(organizationId);
        return alertRepository.findByOrganizationIdAndResolved(organizationId, false).stream()
                .map(this::mapToDTO)
                .toList();
    }

    public AlertResponseDTO resolveAlert(Long alertId) {
        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new ResourceNotFoundException("Alert not found with id: " + alertId));

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

        alert.setResolved(true);
        alert.setResolvedBy(user.getId());
        alert.setResolvedAt(LocalDateTime.now());

        Alert saved = alertRepository.save(alert);

        return mapToDTO(saved);
    }

    private AlertResponseDTO mapToDTO(Alert alert) {
        return AlertResponseDTO.builder()
                .id(alert.getId())
                .organizationId(alert.getOrganizationId())
                .goalId(alert.getGoalId())
                .alertType(alert.getAlertType())
                .message(alert.getMessage())
                .severity(alert.getSeverity())
                .resolved(alert.isResolved())
                .resolvedBy(alert.getResolvedBy())
                .resolvedAt(alert.getResolvedAt())
                .createdAt(alert.getCreatedAt())
                .build();
    }
}
