package com.EcoSphere.Backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class AcceptInvitationRequestDTO {

    @NotBlank
    private String token;

    @NotBlank
    private String name;

    @NotBlank
    private String password;
}
