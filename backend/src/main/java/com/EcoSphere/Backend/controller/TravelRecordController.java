package com.EcoSphere.Backend.controller;

import com.EcoSphere.Backend.dto.CreateTravelRecordRequestDTO;
import com.EcoSphere.Backend.dto.TravelRecordResponseDTO;
import com.EcoSphere.Backend.service.TravelRecordService;
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
@RequestMapping("/api/travel-records")
@RequiredArgsConstructor
public class TravelRecordController {

    private final TravelRecordService travelRecordService;

    @GetMapping
    public ResponseEntity<List<TravelRecordResponseDTO>> getAllTravelRecords() {
        return ResponseEntity.ok(travelRecordService.getAllTravelRecords());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TravelRecordResponseDTO> getTravelRecordById(@PathVariable Long id) {
        return ResponseEntity.ok(travelRecordService.getTravelRecordById(id));
    }

    @GetMapping("/department/{deptId}")
    public ResponseEntity<List<TravelRecordResponseDTO>> getTravelRecordsByDepartment(
            @PathVariable Long deptId) {
        return ResponseEntity.ok(travelRecordService.getTravelRecordsByDepartment(deptId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUSTAINABILITY_MANAGER', 'ADMIN')")
    public ResponseEntity<TravelRecordResponseDTO> createTravelRecord(
            @Valid @RequestBody CreateTravelRecordRequestDTO request) {
        TravelRecordResponseDTO response = travelRecordService.createTravelRecord(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUSTAINABILITY_MANAGER', 'ADMIN')")
    public ResponseEntity<TravelRecordResponseDTO> updateTravelRecord(
            @PathVariable Long id, @Valid @RequestBody CreateTravelRecordRequestDTO request) {
        return ResponseEntity.ok(travelRecordService.updateTravelRecord(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteTravelRecord(@PathVariable Long id) {
        travelRecordService.deleteTravelRecord(id);
        return ResponseEntity.noContent().build();
    }
}
