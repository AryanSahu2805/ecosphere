package com.EcoSphere.Backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LocationResponseDTO {

    private Long id;
    private Long organizationId;
    private String name;
    private String address;
    private String country;
    private LocalDateTime createdAt;
}
