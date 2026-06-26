package com.EcoSphere.Backend.repository;

import com.EcoSphere.Backend.model.Department;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DepartmentRepository extends JpaRepository<Department, Long> {

    List<Department> findByLocationId(Long locationId);

    boolean existsByLocationId(Long locationId);

    boolean existsByNameAndLocationId(String name, Long locationId);
}
