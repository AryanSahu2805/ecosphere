package com.EcoSphere.Backend.controller;

import com.EcoSphere.Backend.dto.LoginRequestDTO;
import com.EcoSphere.Backend.dto.LoginResponseDTO;
import com.EcoSphere.Backend.dto.RegisterRequestDTO;
import com.EcoSphere.Backend.dto.UserResponseDTO;
import com.EcoSphere.Backend.model.User;
import com.EcoSphere.Backend.repository.UserRepository;
import com.EcoSphere.Backend.security.JwtUtil;
import com.EcoSphere.Backend.service.AuditLogService;
import com.EcoSphere.Backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    @PostMapping("/register")
    public ResponseEntity<UserResponseDTO> register(@Valid @RequestBody RegisterRequestDTO request) {
        UserResponseDTO response = userService.registerUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@Valid @RequestBody LoginRequestDTO request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found: " + request.getEmail()));

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

        LoginResponseDTO response = LoginResponseDTO.builder()
                .token(token)
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();

        auditLogService.log(
                "LOGIN",
                "USER",
                user.getId(),
                "User logged in: " + user.getEmail()
        );

        return ResponseEntity.ok(response);
    }
}
