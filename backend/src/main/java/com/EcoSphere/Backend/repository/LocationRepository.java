package com.EcoSphere.Backend.repository;

import com.EcoSphere.Backend.model.Location;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LocationRepository extends JpaRepository<Location, Long> {

    List<Location> findByOrganizationId(Long organizationId);

    boolean existsByOrganizationId(Long organizationId);

    boolean existsByNameAndOrganizationId(String name, Long organizationId);

    List<Long> findIdsByOrganizationId(Long organizationId);
}
