package com.EcoSphere.Backend.service;

import com.EcoSphere.Backend.dto.CompanyRegisterRequestDTO;
import com.EcoSphere.Backend.dto.RegisterRequestDTO;
import com.EcoSphere.Backend.dto.UserResponseDTO;
import com.EcoSphere.Backend.model.Organization;
import com.EcoSphere.Backend.exception.DuplicateResourceException;
import com.EcoSphere.Backend.exception.ResourceNotFoundException;
import com.EcoSphere.Backend.model.Role;
import com.EcoSphere.Backend.model.User;
import com.EcoSphere.Backend.repository.OrganizationRepository;
import com.EcoSphere.Backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final OrganizationRepository organizationRepository;

    public UserResponseDTO registerUser(RegisterRequestDTO request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already in use: " + request.getEmail());
        }

        Role role = request.getRole() != null ? request.getRole() : Role.SUSTAINABILITY_MANAGER;

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .organizationId(request.getOrganizationId())
                .build();

        User saved = userRepository.save(user);

        return UserResponseDTO.builder()
                .id(saved.getId())
                .name(saved.getName())
                .email(saved.getEmail())
                .role(saved.getRole())
                .organizationId(saved.getOrganizationId())
                .createdAt(saved.getCreatedAt())
                .build();
    }

    public List<UserResponseDTO> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(user -> UserResponseDTO.builder()
                        .id(user.getId())
                        .name(user.getName())
                        .email(user.getEmail())
                        .role(user.getRole())
                        .organizationId(user.getOrganizationId())
                        .createdAt(user.getCreatedAt())
                        .build())
                .toList();
    }

    public UserResponseDTO registerCompany(CompanyRegisterRequestDTO request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException(
                    "Email already registered: " + request.getEmail());
        }

        Organization org = Organization.builder()
                .name(request.getOrganizationName())
                .industry("General")
                .build();
        Organization savedOrg = organizationRepository.save(org);

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.ADMIN)
                .organizationId(savedOrg.getId())
                .build();

        User saved = userRepository.save(user);

        return UserResponseDTO.builder()
                .id(saved.getId())
                .name(saved.getName())
                .email(saved.getEmail())
                .role(saved.getRole())
                .organizationId(saved.getOrganizationId())
                .createdAt(saved.getCreatedAt())
                .build();
    }

    public UserResponseDTO assignOrganization(Long userId, Long orgId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found: " + userId));

        if (!organizationRepository.existsById(orgId)) {
            throw new ResourceNotFoundException(
                    "Organization not found: " + orgId);
        }

        user.setOrganizationId(orgId);
        User saved = userRepository.save(user);

        return UserResponseDTO.builder()
                .id(saved.getId())
                .name(saved.getName())
                .email(saved.getEmail())
                .role(saved.getRole())
                .organizationId(saved.getOrganizationId())
                .createdAt(saved.getCreatedAt())
                .build();
    }
}
