package com.EcoSphere.Backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.base-url}")
    private String baseUrl;

    public void sendInvitationEmail(
            String toEmail,
            String invitedByName,
            String organizationName,
            String role,
            String token) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("EcoSphere <" + fromEmail + ">");
            message.setTo(toEmail);
            message.setSubject("You've been invited to EcoSphere — " + organizationName);

            String roleDisplay = formatRole(role);
            String acceptUrl = baseUrl + "/accept-invite/" + token;

            message.setText(
                "Hello,\n\n" +
                invitedByName + " has invited you to join " +
                organizationName + " on EcoSphere as " + roleDisplay + ".\n\n" +
                "EcoSphere is an Enterprise Carbon Intelligence Platform that helps " +
                "organizations track and reduce their carbon emissions.\n\n" +
                "Click the link below to accept your invitation and create your account:\n\n" +
                acceptUrl + "\n\n" +
                "This invitation expires in 48 hours.\n\n" +
                "If you did not expect this invitation, you can safely ignore this email.\n\n" +
                "— The EcoSphere Team\n" +
                "ecosphere.carbon.platform@gmail.com"
            );

            mailSender.send(message);
            log.info("Invitation email sent to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send invitation email to {}: {}", toEmail, e.getMessage());
            throw new RuntimeException("Failed to send invitation email: " + e.getMessage());
        }
    }

    private String formatRole(String role) {
        return switch (role) {
            case "SUSTAINABILITY_MANAGER" -> "Sustainability Manager";
            case "AUDITOR"               -> "Auditor";
            default                      -> role;
        };
    }
}
