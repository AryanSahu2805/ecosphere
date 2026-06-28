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
public class TravelRecordResponseDTO {

    private Long id;
    private Long departmentId;
    private Long userId;
    private BigDecimal distanceKm;
    private String transportMode;
    private BigDecimal co2Emission;
    private LocalDate recordedDate;
    private String notes;
    private LocalDateTime createdAt;
}
