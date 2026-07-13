package com.EcoSphere.Backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "email_preferences")
@EntityListeners(AuditingEntityListener.class)
public class EmailPreferences {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    @Column(name = "organization_id", nullable = false)
    private Long organizationId;

    @Builder.Default
    @Column(name = "alert_level", nullable = false)
    private String alertLevel = "ALL";

    @Builder.Default
    @Column(name = "report_frequency", nullable = false)
    private String reportFrequency = "WEEKLY";

    @Builder.Default
    @Column(name = "reports_enabled", nullable = false,
            columnDefinition = "TINYINT(1) DEFAULT 1")
    private boolean reportsEnabled = true;

    @Builder.Default
    @Column(name = "alerts_enabled", nullable = false,
            columnDefinition = "TINYINT(1) DEFAULT 1")
    private boolean alertsEnabled = true;

    @Column(name = "last_report_sent_at")
    private LocalDateTime lastReportSentAt;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
