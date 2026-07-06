package com.EcoSphere.Backend.controller;

import com.EcoSphere.Backend.dto.AcceptInvitationRequestDTO;
import com.EcoSphere.Backend.dto.InvitationValidationResponseDTO;
import com.EcoSphere.Backend.dto.SendInvitationRequestDTO;
import com.EcoSphere.Backend.service.InvitationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/invitations")
@RequiredArgsConstructor
public class InvitationController {

    private final InvitationService invitationService;

    @PostMapping("/send")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> sendInvitation(
            @Valid @RequestBody SendInvitationRequestDTO req) {
        invitationService.sendInvitation(req);
        return ResponseEntity.ok(Map.of(
                "message", "Invitation sent to " + req.getInvitedEmail()));
    }

    @GetMapping("/validate/{token}")
    public ResponseEntity<InvitationValidationResponseDTO> validate(
            @PathVariable String token) {
        return ResponseEntity.ok(invitationService.validateToken(token));
    }

    @PostMapping("/accept")
    public ResponseEntity<Map<String, String>> accept(
            @Valid @RequestBody AcceptInvitationRequestDTO req) {
        invitationService.acceptInvitation(req);
        return ResponseEntity.ok(Map.of(
                "message", "Account created. You can now sign in."));
    }
}
