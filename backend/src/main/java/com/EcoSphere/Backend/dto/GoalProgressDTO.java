package com.EcoSphere.Backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoalProgressDTO {

    private Long goalId;
    private Long organizationId;
    private String targetMetric;
    private BigDecimal targetValue;
    private BigDecimal baselineValue;
    private BigDecimal currentValue;
    private BigDecimal reductionAchieved;
    private BigDecimal reductionNeeded;
    private BigDecimal progressPercentage;
    private LocalDate deadline;
    private long daysRemaining;
    private String status;
    private boolean onTrack;
}
