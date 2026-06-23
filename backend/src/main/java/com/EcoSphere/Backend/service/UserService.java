package com.EcoSphere.Backend.service;

import com.EcoSphere.Backend.dto.RegisterRequestDTO;
import com.EcoSphere.Backend.dto.UserResponseDTO;
import com.EcoSphere.Backend.model.Role;
import com.EcoSphere.Backend.model.User;
import com.EcoSphere.Backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserResponseDTO registerUser(RegisterRequestDTO request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already in use: " + request.getEmail());
        }

        Role role = request.getRole() != null ? request.getRole() : Role.SUSTAINABILITY_MANAGER;

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .build();

        User saved = userRepository.save(user);

        return UserResponseDTO.builder()
                .id(saved.getId())
                .name(saved.getName())
                .email(saved.getEmail())
                .role(saved.getRole())
                .createdAt(saved.getCreatedAt())
                .build();
    }
}
