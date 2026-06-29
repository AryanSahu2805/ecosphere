package com.EcoSphere.Backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyTrendDTO {

    private int year;
    private int month;
    private String monthName;
    private BigDecimal energyEmissions;
    private BigDecimal travelEmissions;
    private BigDecimal serverEmissions;
    private BigDecimal totalEmissions;
}
