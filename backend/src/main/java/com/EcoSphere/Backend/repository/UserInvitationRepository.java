package com.EcoSphere.Backend.repository;

import com.EcoSphere.Backend.model.UserInvitation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserInvitationRepository extends JpaRepository<UserInvitation, Long> {

    Optional<UserInvitation> findByToken(String token);

    List<UserInvitation> findByOrganizationId(Long orgId);

    boolean existsByInvitedEmailAndAccepted(String email, boolean accepted);

    boolean existsByOrganizationId(Long organizationId);
}
