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
@Table(name = "travel_records")
@EntityListeners(AuditingEntityListener.class)
public class TravelRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "department_id", nullable = false)
    private Long departmentId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "distance_km", precision = 10, scale = 4, nullable = false)
    private BigDecimal distanceKm;

    @Column(name = "transport_mode", nullable = false)
    private String transportMode;

    @Builder.Default
    @Column(name = "co2_emission", precision = 10, scale = 4)
    private BigDecimal co2Emission = BigDecimal.ZERO;

    @Column(name = "recorded_date", nullable = false)
    private LocalDate recordedDate;

    private String notes;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
