package com.EcoSphere.Backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class CreateDepartmentRequestDTO {

    @NotNull(message = "Location ID is required")
    private Long locationId;

    @NotBlank(message = "Department name is required")
    private String name;
}
