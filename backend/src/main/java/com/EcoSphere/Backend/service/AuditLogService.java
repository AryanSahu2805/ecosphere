package com.EcoSphere.Backend.service;

import com.EcoSphere.Backend.dto.AuditLogResponseDTO;
import com.EcoSphere.Backend.model.AuditLog;
import com.EcoSphere.Backend.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public void log(String action, String entityType, Long entityId, String details) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        String userEmail;
        Long userId = null;

        if (auth == null || !auth.isAuthenticated()) {
            userEmail = "SYSTEM";
        } else {
            userEmail = auth.getName();
        }

        AuditLog auditLog = AuditLog.builder()
                .userId(userId)
                .userEmail(userEmail)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .details(details)
                .build();

        auditLogRepository.save(auditLog);

        log.debug("Audit: {} {} {} by {}", action, entityType, entityId, userEmail);
    }

    public Page<AuditLogResponseDTO> getRecentLogs(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return auditLogRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(this::mapToDTO);
    }

    public List<AuditLogResponseDTO> getLogsByUser(Long userId) {
        return auditLogRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToDTO)
                .toList();
    }

    public List<AuditLogResponseDTO> getLogsByEntity(String entityType, Long entityId) {
        return auditLogRepository.findByEntityTypeAndEntityIdOrderByCreatedAtDesc(entityType, entityId).stream()
                .map(this::mapToDTO)
                .toList();
    }

    private AuditLogResponseDTO mapToDTO(AuditLog auditLog) {
        return AuditLogResponseDTO.builder()
                .id(auditLog.getId())
                .userId(auditLog.getUserId())
                .userEmail(auditLog.getUserEmail())
                .action(auditLog.getAction())
                .entityType(auditLog.getEntityType())
                .entityId(auditLog.getEntityId())
                .details(auditLog.getDetails())
                .createdAt(auditLog.getCreatedAt())
                .build();
    }
}
