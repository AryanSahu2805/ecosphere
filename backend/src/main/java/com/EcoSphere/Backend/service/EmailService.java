package com.EcoSphere.Backend.service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
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

    public void sendVerificationEmail(String toEmail, String name, String token) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("EcoSphere <" + fromEmail + ">");
            message.setTo(toEmail);
            message.setSubject("Verify your EcoSphere account");

            String verifyUrl = baseUrl + "/verify-email/" + token;

            message.setText(
                "Hi " + name + ",\n\n" +
                "Welcome to EcoSphere! Please verify your email address to activate " +
                "your account.\n\n" +
                "Click the link below to verify:\n\n" +
                verifyUrl + "\n\n" +
                "This link does not expire.\n\n" +
                "If you did not create an EcoSphere account, you can safely ignore " +
                "this email.\n\n" +
                "— The EcoSphere Team"
            );

            mailSender.send(message);
            log.info("Verification email sent to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send verification email: {}", e.getMessage());
            // Don't throw — account is created, we log the failure but don't block
        }
    }

    public void sendAlertEmail(String toEmail, String adminName, String orgName,
                               String alertType, String severity, String message) {
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom("EcoSphere <" + fromEmail + ">");
            msg.setTo(toEmail);

            String severityLabel = switch (severity) {
                case "HIGH"   -> "HIGH PRIORITY";
                case "MEDIUM" -> "MEDIUM PRIORITY";
                default       -> "NOTICE";
            };

            msg.setSubject("[EcoSphere Alert] " + severityLabel + " — " + orgName);
            msg.setText(
                "Hi " + adminName + ",\n\n" +
                "An alert has been generated for your organization (" + orgName + "):\n\n" +
                "Type:     " + alertType.replace("_", " ") + "\n" +
                "Severity: " + severity + "\n" +
                "Message:  " + message + "\n\n" +
                "Log in to your EcoSphere dashboard to review and resolve this alert:\n" +
                baseUrl + "/app/alerts\n\n" +
                "You are receiving this because your alert notification level is set to " +
                "receive " + severity + " alerts.\n" +
                "Update your preferences in Settings from your profile menu.\n\n" +
                "— The EcoSphere Platform"
            );

            mailSender.send(msg);
            log.info("Alert email sent to: {} severity: {}", toEmail, severity);
        } catch (Exception e) {
            log.error("Failed to send alert email to {}: {}", toEmail, e.getMessage());
        }
    }

    public void sendReportEmail(String toEmail, String adminName, String orgName,
                                String period, String summaryText,
                                byte[] pdfBytes, byte[] csvBytes) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("[EcoSphere] " + period + " Report — " + orgName);
            helper.setText(
                "Hi " + adminName + ",\n\n" +
                "Your " + period.toLowerCase() + " emissions report for " + orgName +
                " is attached.\n\n" +
                "SUMMARY\n" +
                summaryText + "\n\n" +
                "Attached files:\n" +
                "  " + orgName + "-report.pdf\n" +
                "  " + orgName + "-report.csv\n\n" +
                "View your full dashboard at:\n" + baseUrl + "/app/dashboard\n\n" +
                "To change your report frequency, open Settings from your profile menu.\n\n" +
                "— The EcoSphere Platform",
                false
            );

            if (pdfBytes != null && pdfBytes.length > 0) {
                helper.addAttachment(orgName + "-report.pdf",
                        new ByteArrayResource(pdfBytes), "application/pdf");
            }
            if (csvBytes != null && csvBytes.length > 0) {
                helper.addAttachment(orgName + "-report.csv",
                        new ByteArrayResource(csvBytes), "text/csv");
            }

            mailSender.send(message);
            log.info("Report email sent to: {} period: {}", toEmail, period);
        } catch (Exception e) {
            log.error("Failed to send report email to {}: {}", toEmail, e.getMessage());
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
