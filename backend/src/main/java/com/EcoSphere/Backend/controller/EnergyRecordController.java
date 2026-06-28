package com.EcoSphere.Backend.controller;

import com.EcoSphere.Backend.dto.CreateEnergyRecordRequestDTO;
import com.EcoSphere.Backend.dto.EnergyRecordResponseDTO;
import com.EcoSphere.Backend.service.EnergyRecordService;
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
@RequestMapping("/api/energy-records")
@RequiredArgsConstructor
public class EnergyRecordController {

    private final EnergyRecordService energyRecordService;

    @GetMapping
    public ResponseEntity<List<EnergyRecordResponseDTO>> getAllEnergyRecords() {
        return ResponseEntity.ok(energyRecordService.getAllEnergyRecords());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EnergyRecordResponseDTO> getEnergyRecordById(@PathVariable Long id) {
        return ResponseEntity.ok(energyRecordService.getEnergyRecordById(id));
    }

    @GetMapping("/department/{deptId}")
    public ResponseEntity<List<EnergyRecordResponseDTO>> getEnergyRecordsByDepartment(
            @PathVariable Long deptId) {
        return ResponseEntity.ok(energyRecordService.getEnergyRecordsByDepartment(deptId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUSTAINABILITY_MANAGER', 'ADMIN')")
    public ResponseEntity<EnergyRecordResponseDTO> createEnergyRecord(
            @Valid @RequestBody CreateEnergyRecordRequestDTO request) {
        EnergyRecordResponseDTO response = energyRecordService.createEnergyRecord(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUSTAINABILITY_MANAGER', 'ADMIN')")
    public ResponseEntity<EnergyRecordResponseDTO> updateEnergyRecord(
            @PathVariable Long id, @Valid @RequestBody CreateEnergyRecordRequestDTO request) {
        return ResponseEntity.ok(energyRecordService.updateEnergyRecord(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteEnergyRecord(@PathVariable Long id) {
        energyRecordService.deleteEnergyRecord(id);
        return ResponseEntity.noContent().build();
    }
}
