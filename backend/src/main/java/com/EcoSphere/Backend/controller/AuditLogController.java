package com.EcoSphere.Backend.controller;

import com.EcoSphere.Backend.dto.AuditLogResponseDTO;
import com.EcoSphere.Backend.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/audit-logs")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'AUDITOR')")
public class AuditLogController {

    private final AuditLogService auditLogService;

    @GetMapping
    public ResponseEntity<Page<AuditLogResponseDTO>> getRecentLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(auditLogService.getRecentLogs(page, size));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<AuditLogResponseDTO>> getLogsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(auditLogService.getLogsByUser(userId));
    }

    @GetMapping("/entity/{entityType}/{entityId}")
    public ResponseEntity<List<AuditLogResponseDTO>> getLogsByEntity(
            @PathVariable String entityType, @PathVariable Long entityId) {
        return ResponseEntity.ok(auditLogService.getLogsByEntity(entityType, entityId));
    }
}
