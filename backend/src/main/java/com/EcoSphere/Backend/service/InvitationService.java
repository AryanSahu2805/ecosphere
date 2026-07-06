package com.EcoSphere.Backend.service;

import com.EcoSphere.Backend.dto.AcceptInvitationRequestDTO;
import com.EcoSphere.Backend.dto.InvitationValidationResponseDTO;
import com.EcoSphere.Backend.dto.SendInvitationRequestDTO;
import com.EcoSphere.Backend.exception.DuplicateResourceException;
import com.EcoSphere.Backend.exception.ResourceNotFoundException;
import com.EcoSphere.Backend.model.Organization;
import com.EcoSphere.Backend.model.Role;
import com.EcoSphere.Backend.model.User;
import com.EcoSphere.Backend.model.UserInvitation;
import com.EcoSphere.Backend.repository.OrganizationRepository;
import com.EcoSphere.Backend.repository.UserInvitationRepository;
import com.EcoSphere.Backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class InvitationService {

    private final UserInvitationRepository invitationRepository;
    private final UserRepository           userRepository;
    private final OrganizationRepository   organizationRepository;
    private final PasswordEncoder          passwordEncoder;
    private final EmailService             emailService;

    public void sendInvitation(SendInvitationRequestDTO request) {
        String adminEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        Long orgId = request.getOrganizationId();

        Organization org = organizationRepository
                .findById(orgId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Organization not found: " + orgId));

        // Admin can invite to any org; non-admins can only invite to their own
        if (!admin.getRole().equals(Role.ADMIN)) {
            if (!orgId.equals(admin.getOrganizationId())) {
                throw new DuplicateResourceException(
                        "You can only invite members to your own organization.");
            }
        }

        if (userRepository.existsByEmail(request.getInvitedEmail())) {
            throw new DuplicateResourceException(
                    "A user with this email already exists.");
        }

        if (invitationRepository.existsByInvitedEmailAndAccepted(request.getInvitedEmail(), false)) {
            throw new DuplicateResourceException(
                    "An invitation has already been sent to this email address.");
        }

        if (!request.getRole().equals("SUSTAINABILITY_MANAGER")
                && !request.getRole().equals("AUDITOR")) {
            throw new ResourceNotFoundException(
                    "Invalid role. Must be SUSTAINABILITY_MANAGER or AUDITOR.");
        }

        String token = UUID.randomUUID().toString().replace("-", "")
                + UUID.randomUUID().toString().replace("-", "");

        UserInvitation invitation = UserInvitation.builder()
                .token(token)
                .invitedEmail(request.getInvitedEmail())
                .role(request.getRole())
                .organizationId(orgId)
                .invitedByUserId(admin.getId())
                .accepted(false)
                .expiresAt(LocalDateTime.now().plusHours(48))
                .build();

        invitationRepository.save(invitation);

        emailService.sendInvitationEmail(
                request.getInvitedEmail(),
                admin.getName(),
                org.getName(),
                request.getRole(),
                token);
    }

    public InvitationValidationResponseDTO validateToken(String token) {
        UserInvitation invitation = invitationRepository.findByToken(token).orElse(null);

        if (invitation == null) {
            return InvitationValidationResponseDTO.builder()
                    .valid(false).message("Invalid invitation link.").build();
        }
        if (invitation.isAccepted()) {
            return InvitationValidationResponseDTO.builder()
                    .valid(false).message("This invitation has already been used.").build();
        }
        if (invitation.getExpiresAt().isBefore(LocalDateTime.now())) {
            return InvitationValidationResponseDTO.builder()
                    .valid(false)
                    .message("This invitation has expired. Ask your admin to send a new one.")
                    .build();
        }

        Organization org = organizationRepository.findById(invitation.getOrganizationId())
                .orElseThrow();

        return InvitationValidationResponseDTO.builder()
                .valid(true)
                .invitedEmail(invitation.getInvitedEmail())
                .role(invitation.getRole())
                .organizationId(invitation.getOrganizationId())
                .organizationName(org.getName())
                .message("Valid invitation.")
                .build();
    }

    public void acceptInvitation(AcceptInvitationRequestDTO req) {
        UserInvitation invitation = invitationRepository.findByToken(req.getToken())
                .orElseThrow(() -> new ResourceNotFoundException("Invalid token."));

        if (invitation.isAccepted()) {
            throw new DuplicateResourceException("Invitation already used.");
        }
        if (invitation.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ResourceNotFoundException("Invitation expired.");
        }

        User user = User.builder()
                .name(req.getName())
                .email(invitation.getInvitedEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .role(Role.valueOf(invitation.getRole()))
                .organizationId(invitation.getOrganizationId())
                .build();

        userRepository.save(user);

        invitation.setAccepted(true);
        invitationRepository.save(invitation);

        log.info("Invitation accepted by: {}", invitation.getInvitedEmail());
    }
}
