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
public class EmissionsSummaryDTO {

    private Long organizationId;
    private LocalDate fromDate;
    private LocalDate toDate;
    private BigDecimal totalEnergyEmissions;
    private BigDecimal totalTravelEmissions;
    private BigDecimal totalServerEmissions;
    private BigDecimal totalEmissions;
    private int energyRecordCount;
    private int travelRecordCount;
    private int serverRecordCount;
}
