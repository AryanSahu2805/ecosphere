package com.EcoSphere.Backend.controller;

import com.EcoSphere.Backend.dto.AlertResponseDTO;
import com.EcoSphere.Backend.service.AlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
public class AlertController {

    private final AlertService alertService;

    @GetMapping("/organization/{orgId}")
    public ResponseEntity<List<AlertResponseDTO>> getAlertsByOrganization(@PathVariable Long orgId) {
        return ResponseEntity.ok(alertService.getAlertsByOrganization(orgId));
    }

    @GetMapping("/organization/{orgId}/active")
    public ResponseEntity<List<AlertResponseDTO>> getUnresolvedAlerts(@PathVariable Long orgId) {
        return ResponseEntity.ok(alertService.getUnresolvedAlerts(orgId));
    }

    @PutMapping("/{id}/resolve")
    @PreAuthorize("hasAnyRole('SUSTAINABILITY_MANAGER', 'ADMIN')")
    public ResponseEntity<AlertResponseDTO> resolveAlert(@PathVariable Long id) {
        return ResponseEntity.ok(alertService.resolveAlert(id));
    }
}
