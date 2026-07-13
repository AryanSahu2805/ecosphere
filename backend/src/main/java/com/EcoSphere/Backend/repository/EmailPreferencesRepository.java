package com.EcoSphere.Backend.repository;

import com.EcoSphere.Backend.model.EmailPreferences;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EmailPreferencesRepository extends JpaRepository<EmailPreferences, Long> {

    Optional<EmailPreferences> findByUserId(Long userId);

    List<EmailPreferences> findByReportsEnabledTrue();

    List<EmailPreferences> findByAlertsEnabledTrue();
}
