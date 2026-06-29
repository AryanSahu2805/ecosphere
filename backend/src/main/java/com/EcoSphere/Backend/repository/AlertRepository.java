package com.EcoSphere.Backend.repository;

import com.EcoSphere.Backend.model.Alert;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AlertRepository extends JpaRepository<Alert, Long> {

    List<Alert> findByOrganizationId(Long organizationId);

    List<Alert> findByOrganizationIdAndResolved(Long organizationId, boolean resolved);

    boolean existsByGoalIdAndAlertTypeAndResolved(Long goalId, String alertType, boolean resolved);

    List<Alert> findByOrganizationIdOrderByCreatedAtDesc(Long organizationId);
}
