package com.EcoSphere.Backend.repository;

import com.EcoSphere.Backend.model.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DepartmentRepository extends JpaRepository<Department, Long> {

    List<Department> findByLocationId(Long locationId);

    boolean existsByLocationId(Long locationId);

    boolean existsByNameAndLocationId(String name, Long locationId);

    @Query("SELECT d.id FROM Department d WHERE d.locationId IN :locationIds")
    List<Long> findIdsByLocationIdIn(@Param("locationIds") List<Long> locationIds);
}
