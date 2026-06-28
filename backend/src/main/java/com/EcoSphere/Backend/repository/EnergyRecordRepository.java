package com.EcoSphere.Backend.repository;

import com.EcoSphere.Backend.model.EnergyRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface EnergyRecordRepository extends JpaRepository<EnergyRecord, Long> {

    List<EnergyRecord> findByDepartmentId(Long departmentId);

    List<EnergyRecord> findByUserId(Long userId);

    boolean existsByDepartmentId(Long departmentId);

    List<EnergyRecord> findByDepartmentIdAndRecordedDateBetween(Long departmentId, LocalDate from, LocalDate to);
}
