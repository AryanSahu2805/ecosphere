package com.EcoSphere.Backend.repository;

import com.EcoSphere.Backend.model.Location;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface LocationRepository extends JpaRepository<Location, Long> {

    List<Location> findByOrganizationId(Long organizationId);

    boolean existsByOrganizationId(Long organizationId);

    boolean existsByNameAndOrganizationId(String name, Long organizationId);

    @Query("SELECT l.id FROM Location l WHERE l.organizationId = :organizationId")
    List<Long> findIdsByOrganizationId(@Param("organizationId") Long organizationId);
}
