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
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "sustainability_goals")
@EntityListeners(AuditingEntityListener.class)
public class SustainabilityGoal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "organization_id", nullable = false)
    private Long organizationId;

    @Column(name = "target_metric", nullable = false)
    private String targetMetric;

    @Column(name = "target_value", precision = 10, scale = 4, nullable = false)
    private BigDecimal targetValue;

    @Column(name = "baseline_value", precision = 10, scale = 4, nullable = false)
    private BigDecimal baselineValue;

    @Column(nullable = false)
    private LocalDate deadline;

    @Builder.Default
    @Column(nullable = false)
    private String status = "ACTIVE";

    private String description;

    @Column(name = "created_by", nullable = false)
    private Long createdBy;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
