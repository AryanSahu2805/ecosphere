package com.EcoSphere.Backend.controller;

import com.EcoSphere.Backend.dto.CreateGoalRequestDTO;
import com.EcoSphere.Backend.dto.GoalProgressDTO;
import com.EcoSphere.Backend.dto.GoalResponseDTO;
import com.EcoSphere.Backend.scheduler.AlertScheduler;
import com.EcoSphere.Backend.service.GoalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/goals")
@RequiredArgsConstructor
public class GoalController {

    private final GoalService goalService;
    private final AlertScheduler alertScheduler;

    @GetMapping
    public ResponseEntity<List<GoalResponseDTO>> getAllGoals() {
        return ResponseEntity.ok(goalService.getAllGoals());
    }

    @GetMapping("/organization/{orgId}")
    public ResponseEntity<List<GoalResponseDTO>> getGoalsByOrganization(@PathVariable Long orgId) {
        return ResponseEntity.ok(goalService.getGoalsByOrganization(orgId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<GoalResponseDTO> getGoalById(@PathVariable Long id) {
        return ResponseEntity.ok(goalService.getGoalById(id));
    }

    @GetMapping("/{id}/progress")
    public ResponseEntity<GoalProgressDTO> getGoalProgress(@PathVariable Long id) {
        return ResponseEntity.ok(goalService.getGoalProgress(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUSTAINABILITY_MANAGER', 'ADMIN')")
    public ResponseEntity<GoalResponseDTO> createGoal(@Valid @RequestBody CreateGoalRequestDTO request) {
        GoalResponseDTO response = goalService.createGoal(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> cancelGoal(@PathVariable Long id) {
        goalService.cancelGoal(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/trigger-alert-check")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> triggerAlertCheck() {
        alertScheduler.checkGoalsAndGenerateAlerts();
        return ResponseEntity.ok(Map.of("message", "Alert check triggered manually"));
    }
}
