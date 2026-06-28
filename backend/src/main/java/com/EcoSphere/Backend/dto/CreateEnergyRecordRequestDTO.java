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
public class CreateEnergyRecordRequestDTO {

    @NotNull
    private Long departmentId;

    @NotNull
    @DecimalMin(value = "0.01", message = "Consumption must be greater than 0")
    private BigDecimal consumptionKwh;

    @NotBlank
    private String energyType;

    @NotNull
    private LocalDate recordedDate;

    private String notes;
}
