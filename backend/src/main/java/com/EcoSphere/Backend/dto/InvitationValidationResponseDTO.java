package com.EcoSphere.Backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvitationValidationResponseDTO {

    private boolean valid;
    private String invitedEmail;
    private String role;
    private Long organizationId;
    private String organizationName;
    private String message;
}
