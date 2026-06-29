package com.EcoSphere.Backend.controller;

import com.EcoSphere.Backend.dto.EmissionsSummaryDTO;
import com.EcoSphere.Backend.dto.MonthlyTrendDTO;
import com.EcoSphere.Backend.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/emissions")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/summary")
    public ResponseEntity<EmissionsSummaryDTO> getEmissionsSummary(
            @RequestParam Long organizationId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(analyticsService.getEmissionsSummary(organizationId, from, to));
    }

    @GetMapping("/trends")
    public ResponseEntity<List<MonthlyTrendDTO>> getMonthlyTrends(
            @RequestParam Long organizationId,
            @RequestParam(defaultValue = "#{T(java.time.Year).now().getValue()}") int year) {
        return ResponseEntity.ok(analyticsService.getMonthlyTrends(organizationId, year));
    }
}
