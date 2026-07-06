package com.EcoSphere.Backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class SendInvitationRequestDTO {

    @Email
    @NotBlank
    private String invitedEmail;

    @NotBlank
    private String role;

    @NotNull(message = "Organization is required")
    private Long organizationId;
}
