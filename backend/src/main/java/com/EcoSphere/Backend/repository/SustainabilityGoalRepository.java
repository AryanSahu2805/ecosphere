package com.EcoSphere.Backend.repository;

import com.EcoSphere.Backend.model.SustainabilityGoal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SustainabilityGoalRepository extends JpaRepository<SustainabilityGoal, Long> {

    List<SustainabilityGoal> findByOrganizationId(Long organizationId);

    List<SustainabilityGoal> findByStatus(String status);

    List<SustainabilityGoal> findByOrganizationIdAndStatus(Long organizationId, String status);
}
