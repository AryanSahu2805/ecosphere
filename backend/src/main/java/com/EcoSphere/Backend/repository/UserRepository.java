package com.EcoSphere.Backend.repository;

import com.EcoSphere.Backend.model.Role;
import com.EcoSphere.Backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<User> findByVerificationToken(String verificationToken);

    List<User> findByRole(Role role);
}
