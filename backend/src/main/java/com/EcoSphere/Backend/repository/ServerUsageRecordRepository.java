package com.EcoSphere.Backend.repository;

import com.EcoSphere.Backend.model.ServerUsageRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface ServerUsageRecordRepository extends JpaRepository<ServerUsageRecord, Long> {

    List<ServerUsageRecord> findByDepartmentId(Long departmentId);

    List<ServerUsageRecord> findByUserId(Long userId);

    boolean existsByDepartmentId(Long departmentId);

    List<ServerUsageRecord> findByDepartmentIdAndRecordedDateBetween(Long departmentId, LocalDate from, LocalDate to);
}
