package com.EcoSphere.Backend.repository;

import com.EcoSphere.Backend.model.TravelRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface TravelRecordRepository extends JpaRepository<TravelRecord, Long> {

    List<TravelRecord> findByDepartmentId(Long departmentId);

    List<TravelRecord> findByUserId(Long userId);

    boolean existsByDepartmentId(Long departmentId);

    List<TravelRecord> findByDepartmentIdAndRecordedDateBetween(Long departmentId, LocalDate from, LocalDate to);
}
