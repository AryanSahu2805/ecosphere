package com.EcoSphere.Backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
public class CreateGoalRequestDTO {

    @NotNull
    private Long organizationId;

    @NotBlank
    private String targetMetric;

    @NotNull
    @DecimalMin("0.01")
    private BigDecimal targetValue;

    @NotNull
    private LocalDate deadline;

    private String description;
}
