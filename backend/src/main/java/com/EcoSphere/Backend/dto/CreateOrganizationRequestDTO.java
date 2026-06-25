package com.EcoSphere.Backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class CreateOrganizationRequestDTO {

    @NotBlank(message = "Organization name is required")
    private String name;

    private String industry;
}
