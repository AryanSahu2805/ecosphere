package com.EcoSphere.Backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmailPreferencesDTO {
    private Long id;
    private String alertLevel;
    private String reportFrequency;
    private boolean reportsEnabled;
    private boolean alertsEnabled;
}
