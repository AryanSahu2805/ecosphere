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
public class CreateTravelRecordRequestDTO {

    @NotNull
    private Long departmentId;

    @NotNull
    @DecimalMin(value = "0.01", message = "Distance must be greater than 0")
    private BigDecimal distanceKm;

    @NotBlank
    private String transportMode;

    @NotNull
    private LocalDate recordedDate;

    private String notes;
}
