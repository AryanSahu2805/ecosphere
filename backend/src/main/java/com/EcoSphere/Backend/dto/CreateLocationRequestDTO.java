package com.EcoSphere.Backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class CreateLocationRequestDTO {

    @NotNull(message = "Organization ID is required")
    private Long organizationId;

    @NotBlank(message = "Location name is required")
    private String name;

    private String address;

    private String country;
}
