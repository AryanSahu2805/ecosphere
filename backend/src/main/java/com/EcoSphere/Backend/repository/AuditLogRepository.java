package com.EcoSphere.Backend.repository;

import com.EcoSphere.Backend.model.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    List<AuditLog> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<AuditLog> findByEntityTypeAndEntityIdOrderByCreatedAtDesc(String entityType, Long entityId);

    List<AuditLog> findByActionOrderByCreatedAtDesc(String action);

    Page<AuditLog> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
