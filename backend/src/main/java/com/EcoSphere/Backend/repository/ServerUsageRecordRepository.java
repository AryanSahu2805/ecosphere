package com.EcoSphere.Backend.repository;

import com.EcoSphere.Backend.model.ServerUsageRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface ServerUsageRecordRepository extends JpaRepository<ServerUsageRecord, Long> {

    List<ServerUsageRecord> findByDepartmentId(Long departmentId);

    List<ServerUsageRecord> findByDepartmentIdIn(List<Long> departmentIds);

    List<ServerUsageRecord> findByUserId(Long userId);

    boolean existsByDepartmentId(Long departmentId);

    List<ServerUsageRecord> findByDepartmentIdAndRecordedDateBetween(Long departmentId, LocalDate from, LocalDate to);

    @Query(value = "SELECT COALESCE(SUM(co2_emission), 0) " +
                   "FROM server_usage_records " +
                   "WHERE department_id IN :departmentIds " +
                   "AND recorded_date BETWEEN :from AND :to",
           nativeQuery = true)
    BigDecimal sumCo2ByDepartmentIds(
            @Param("departmentIds") List<Long> departmentIds,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to);

    @Query(value = "SELECT COUNT(*) FROM server_usage_records " +
                   "WHERE department_id IN :departmentIds " +
                   "AND recorded_date BETWEEN :from AND :to",
           nativeQuery = true)
    int countByDepartmentIds(
            @Param("departmentIds") List<Long> departmentIds,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to);

    @Query(value = "SELECT YEAR(recorded_date) as year, " +
                   "MONTH(recorded_date) as month, " +
                   "COALESCE(SUM(co2_emission), 0) as total " +
                   "FROM server_usage_records " +
                   "WHERE department_id IN :departmentIds " +
                   "AND YEAR(recorded_date) = :year " +
                   "GROUP BY YEAR(recorded_date), MONTH(recorded_date) " +
                   "ORDER BY month",
           nativeQuery = true)
    List<Object[]> monthlyEmissionsByDepartmentIds(
            @Param("departmentIds") List<Long> departmentIds,
            @Param("year") int year);
}
