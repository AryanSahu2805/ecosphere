package com.EcoSphere.Backend.controller;

import com.EcoSphere.Backend.dto.CompanyRegisterRequestDTO;
import com.EcoSphere.Backend.dto.LoginRequestDTO;
import com.EcoSphere.Backend.dto.LoginResponseDTO;
import com.EcoSphere.Backend.dto.RegisterRequestDTO;
import com.EcoSphere.Backend.dto.UserResponseDTO;
import com.EcoSphere.Backend.model.Organization;
import com.EcoSphere.Backend.model.User;
import com.EcoSphere.Backend.repository.DepartmentRepository;
import com.EcoSphere.Backend.repository.EnergyRecordRepository;
import com.EcoSphere.Backend.repository.LocationRepository;
import com.EcoSphere.Backend.repository.OrganizationRepository;
import com.EcoSphere.Backend.repository.ServerUsageRecordRepository;
import com.EcoSphere.Backend.repository.TravelRecordRepository;
import com.EcoSphere.Backend.repository.UserInvitationRepository;
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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;
    private final OrganizationRepository organizationRepository;
    private final LocationRepository locationRepository;
    private final DepartmentRepository departmentRepository;
    private final EnergyRecordRepository energyRecordRepository;
    private final TravelRecordRepository travelRecordRepository;
    private final ServerUsageRecordRepository serverUsageRecordRepository;
    private final UserInvitationRepository userInvitationRepository;

    @PostMapping("/register")
    public ResponseEntity<UserResponseDTO> register(@Valid @RequestBody RegisterRequestDTO request) {
        UserResponseDTO response = userService.registerUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequestDTO request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found: " + request.getEmail()));

        if (!user.isVerified()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                    Map.of("error",
                            "Please verify your email address before signing in. " +
                            "Check your inbox for the verification link.",
                            "code", "EMAIL_NOT_VERIFIED"));
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

        LoginResponseDTO response = LoginResponseDTO.builder()
                .token(token)
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .organizationId(user.getOrganizationId())
                .build();

        auditLogService.log(
                "LOGIN",
                "USER",
                user.getId(),
                "User logged in: " + user.getEmail()
        );

        return ResponseEntity.ok(response);
    }

    @PostMapping("/register-company")
    public ResponseEntity<UserResponseDTO> registerCompany(
            @Valid @RequestBody CompanyRegisterRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(userService.registerCompany(request));
    }

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponseDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PutMapping("/users/{userId}/organization/{orgId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponseDTO> assignOrganization(
            @PathVariable Long userId,
            @PathVariable Long orgId) {
        return ResponseEntity.ok(
                userService.assignOrganization(userId, orgId));
    }

    @DeleteMapping("/users/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long userId) {
        userService.deleteUser(userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/verify")
    public ResponseEntity<Map<String, String>> verify(@RequestParam String token) {
        User user = userRepository.findByVerificationToken(token).orElse(null);

        if (user == null) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", "Invalid verification link."));
        }

        if (user.isVerified()) {
            return ResponseEntity.ok(
                    Map.of("message", "Account already verified. You can sign in."));
        }

        user.setVerified(true);
        user.setVerificationToken(null);
        userRepository.save(user);

        return ResponseEntity.ok(
                Map.of("message", "Email verified successfully! You can now sign in."));
    }

    @GetMapping("/onboarding-status")
    public ResponseEntity<Map<String, Boolean>> getOnboardingStatus() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();

        Long orgId = null;
        if (user.getOrganizationId() != null) {
            orgId = user.getOrganizationId();
        } else {
            List<Organization> owned =
                    organizationRepository.findByCreatedByUserId(user.getId());
            if (!owned.isEmpty()) {
                orgId = owned.get(0).getId();
            }
        }

        if (orgId == null) {
            return ResponseEntity.ok(Map.of(
                    "hasLocation", false,
                    "hasDepartment", false,
                    "hasRecord", false,
                    "hasInvite", false));
        }

        final Long finalOrgId = orgId;

        boolean hasLocation = !locationRepository
                .findByOrganizationId(finalOrgId).isEmpty();

        List<Long> locationIds = locationRepository
                .findIdsByOrganizationId(finalOrgId);
        boolean hasDepartment = !locationIds.isEmpty() &&
                !departmentRepository.findIdsByLocationIdIn(locationIds).isEmpty();

        List<Long> deptIds = locationIds.isEmpty()
                ? List.of()
                : departmentRepository.findIdsByLocationIdIn(locationIds);

        boolean hasRecord = !deptIds.isEmpty() && (
                !energyRecordRepository.findByDepartmentIdIn(deptIds).isEmpty()
                || !travelRecordRepository.findByDepartmentIdIn(deptIds).isEmpty()
                || !serverUsageRecordRepository.findByDepartmentIdIn(deptIds).isEmpty()
        );

        boolean hasInvite = userInvitationRepository
                .existsByOrganizationId(finalOrgId);

        return ResponseEntity.ok(Map.of(
                "hasLocation", hasLocation,
                "hasDepartment", hasDepartment,
                "hasRecord", hasRecord,
                "hasInvite", hasInvite));
    }
}
