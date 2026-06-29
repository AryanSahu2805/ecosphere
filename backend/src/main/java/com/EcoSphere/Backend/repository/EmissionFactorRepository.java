package com.EcoSphere.Backend.repository;

import com.EcoSphere.Backend.model.EmissionFactor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EmissionFactorRepository extends JpaRepository<EmissionFactor, Long> {

    Optional<EmissionFactor> findByActivityType(String activityType);

    List<EmissionFactor> findByCategory(String category);
}
