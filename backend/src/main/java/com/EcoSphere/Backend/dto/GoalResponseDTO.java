package com.EcoSphere.Backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoalResponseDTO {

    private Long id;
    private Long organizationId;
    private String targetMetric;
    private BigDecimal targetValue;
    private BigDecimal baselineValue;
    private LocalDate deadline;
    private String status;
    private String description;
    private Long createdBy;
    private LocalDateTime createdAt;
}
