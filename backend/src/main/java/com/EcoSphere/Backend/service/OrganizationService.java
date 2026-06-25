package com.EcoSphere.Backend.service;

import com.EcoSphere.Backend.dto.CreateOrganizationRequestDTO;
import com.EcoSphere.Backend.dto.OrganizationResponseDTO;
import com.EcoSphere.Backend.exception.DuplicateResourceException;
import com.EcoSphere.Backend.exception.ResourceNotFoundException;
import com.EcoSphere.Backend.model.Organization;
import com.EcoSphere.Backend.repository.OrganizationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OrganizationService {

    private final OrganizationRepository organizationRepository;

    public OrganizationResponseDTO createOrganization(CreateOrganizationRequestDTO request) {
        if (organizationRepository.existsByName(request.getName())) {
            throw new DuplicateResourceException("Organization already exists with name: " + request.getName());
        }

        Organization organization = Organization.builder()
                .name(request.getName())
                .industry(request.getIndustry())
                .build();

        Organization saved = organizationRepository.save(organization);

        return mapToDTO(saved);
    }

    public List<OrganizationResponseDTO> getAllOrganizations() {
        return organizationRepository.findAll().stream()
                .map(this::mapToDTO)
                .toList();
    }

    public OrganizationResponseDTO getOrganizationById(Long id) {
        Organization organization = organizationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with id: " + id));

        return mapToDTO(organization);
    }

    public OrganizationResponseDTO updateOrganization(Long id, CreateOrganizationRequestDTO request) {
        Organization organization = organizationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with id: " + id));

        String newName = request.getName();
        if (!newName.equals(organization.getName()) && organizationRepository.existsByName(newName)) {
            throw new DuplicateResourceException("Organization already exists with name: " + newName);
        }

        organization.setName(newName);
        organization.setIndustry(request.getIndustry());

        Organization saved = organizationRepository.save(organization);

        return mapToDTO(saved);
    }

    public void deleteOrganization(Long id) {
        Organization organization = organizationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with id: " + id));

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
