package com.EcoSphere.Backend.controller;

import com.EcoSphere.Backend.dto.CreateServerUsageRecordRequestDTO;
import com.EcoSphere.Backend.dto.ServerUsageRecordResponseDTO;
import com.EcoSphere.Backend.service.ServerUsageRecordService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/server-usage-records")
@RequiredArgsConstructor
public class ServerUsageRecordController {

    private final ServerUsageRecordService serverUsageRecordService;

    @GetMapping
    public ResponseEntity<List<ServerUsageRecordResponseDTO>> getAllServerUsageRecords() {
        return ResponseEntity.ok(serverUsageRecordService.getAllServerUsageRecords());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServerUsageRecordResponseDTO> getServerUsageRecordById(@PathVariable Long id) {
        return ResponseEntity.ok(serverUsageRecordService.getServerUsageRecordById(id));
    }

    @GetMapping("/department/{deptId}")
    public ResponseEntity<List<ServerUsageRecordResponseDTO>> getServerUsageRecordsByDepartment(
            @PathVariable Long deptId) {
        return ResponseEntity.ok(serverUsageRecordService.getServerUsageRecordsByDepartment(deptId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUSTAINABILITY_MANAGER', 'ADMIN')")
    public ResponseEntity<ServerUsageRecordResponseDTO> createServerUsageRecord(
            @Valid @RequestBody CreateServerUsageRecordRequestDTO request) {
        ServerUsageRecordResponseDTO response = serverUsageRecordService.createServerUsageRecord(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUSTAINABILITY_MANAGER', 'ADMIN')")
    public ResponseEntity<ServerUsageRecordResponseDTO> updateServerUsageRecord(
            @PathVariable Long id, @Valid @RequestBody CreateServerUsageRecordRequestDTO request) {
        return ResponseEntity.ok(serverUsageRecordService.updateServerUsageRecord(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteServerUsageRecord(@PathVariable Long id) {
        serverUsageRecordService.deleteServerUsageRecord(id);
        return ResponseEntity.noContent().build();
    }
}
