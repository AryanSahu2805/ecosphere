package com.EcoSphere.Backend.service;

import com.EcoSphere.Backend.dto.CreateOrganizationRequestDTO;
import com.EcoSphere.Backend.dto.OrganizationResponseDTO;
import com.EcoSphere.Backend.exception.DuplicateResourceException;
import com.EcoSphere.Backend.exception.ResourceNotFoundException;
import com.EcoSphere.Backend.model.Organization;
import com.EcoSphere.Backend.model.Role;
import com.EcoSphere.Backend.model.User;
import com.EcoSphere.Backend.repository.LocationRepository;
import com.EcoSphere.Backend.repository.OrganizationRepository;
import com.EcoSphere.Backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OrganizationService {

    private final OrganizationRepository organizationRepository;
    private final LocationRepository     locationRepository;
    private final UserRepository         userRepository;

    // ─── helpers ─────────────────────────────────────────────────────────────

    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElse(null);
    }

    /** Returns true if this admin created orgs (tenant admin), false if they have none (platform admin). */
    private boolean isTenantAdmin(User user) {
        if (user == null || user.getRole() != Role.ADMIN) return false;
        if (user.getOrganizationId() != null) return true; // edge case
        return !organizationRepository.findByCreatedByUserId(user.getId()).isEmpty();
    }

    // ─── access guard ─────────────────────────────────────────────────────────

    public void verifyAccessToOrganization(Long organizationId) {
        User user = currentUser();
        if (user == null) throw new ResourceNotFoundException("User not found");

        // Non-admins: must belong to this org
        if (user.getRole() != Role.ADMIN) {
            if (!organizationId.equals(user.getOrganizationId())) {
                throw new AccessDeniedException("Access denied to this organization.");
            }
            return;
        }

        // Admin with a fixed org (edge case)
        if (user.getOrganizationId() != null) {
            if (!organizationId.equals(user.getOrganizationId())) {
                throw new AccessDeniedException("Access denied to this organization.");
            }
            return;
        }

        // Platform admin: if they own orgs, verify ownership; else allow all
        List<Organization> owned = organizationRepository.findByCreatedByUserId(user.getId());
        if (!owned.isEmpty()) {
            boolean ownsThis = owned.stream().anyMatch(o -> o.getId().equals(organizationId));
            if (!ownsThis) {
                throw new AccessDeniedException("Access denied to this organization.");
            }
        }
        // original platform admin with no owned orgs → allow all
    }

    // ─── CRUD ─────────────────────────────────────────────────────────────────

    public OrganizationResponseDTO createOrganization(CreateOrganizationRequestDTO request) {
        if (organizationRepository.existsByName(request.getName())) {
            throw new DuplicateResourceException("Organization already exists with name: " + request.getName());
        }

        User user = currentUser();

        Organization organization = Organization.builder()
                .name(request.getName())
                .industry(request.getIndustry())
                .createdByUserId(user != null ? user.getId() : null)
                .build();

        Organization saved = organizationRepository.save(organization);
        return mapToDTO(saved);
    }

    public List<OrganizationResponseDTO> getAllOrganizations() {
        User user = currentUser();

        List<Organization> orgs;

        if (user == null) {
            orgs = organizationRepository.findAll();
        } else if (user.getRole() == Role.ADMIN && user.getOrganizationId() == null) {
            List<Organization> owned = organizationRepository.findByCreatedByUserId(user.getId());
            // Platform admin (no owned orgs) sees everything; tenant admin sees only their orgs
            orgs = owned.isEmpty() ? organizationRepository.findAll() : owned;
        } else {
            orgs = organizationRepository.findAll();
        }

        return orgs.stream().map(this::mapToDTO).toList();
    }

    public OrganizationResponseDTO getOrganizationById(Long id) {
        verifyAccessToOrganization(id);
        Organization organization = organizationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with id: " + id));
        return mapToDTO(organization);
    }

    public OrganizationResponseDTO updateOrganization(Long id, CreateOrganizationRequestDTO request) {
        verifyAccessToOrganization(id);
        Organization organization = organizationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with id: " + id));

        String newName = request.getName();
        if (!newName.equals(organization.getName()) && organizationRepository.existsByName(newName)) {
            throw new DuplicateResourceException("Organization already exists with name: " + newName);
        }

        organization.setName(newName);
        organization.setIndustry(request.getIndustry());
        return mapToDTO(organizationRepository.save(organization));
    }

    public void deleteOrganization(Long id) {
        verifyAccessToOrganization(id);
        Organization organization = organizationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with id: " + id));

        if (locationRepository.existsByOrganizationId(id)) {
            throw new DuplicateResourceException(
                    "Cannot delete organization: locations still exist. Delete all locations first.");
        }

        organizationRepository.delete(organization);
    }

    private OrganizationResponseDTO mapToDTO(Organization organization) {
        return OrganizationResponseDTO.builder()
                .id(organization.getId())
                .name(organization.getName())
                .industry(organization.getIndustry())
                .createdAt(organization.getCreatedAt())
                .build();
    }
}
