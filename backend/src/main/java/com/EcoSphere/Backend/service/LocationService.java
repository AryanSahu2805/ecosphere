package com.EcoSphere.Backend.service;

import com.EcoSphere.Backend.dto.CreateLocationRequestDTO;
import com.EcoSphere.Backend.dto.LocationResponseDTO;
import com.EcoSphere.Backend.exception.DuplicateResourceException;
import com.EcoSphere.Backend.exception.ResourceNotFoundException;
import com.EcoSphere.Backend.model.Location;
import com.EcoSphere.Backend.repository.DepartmentRepository;
import com.EcoSphere.Backend.repository.LocationRepository;
import com.EcoSphere.Backend.repository.OrganizationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LocationService {

    private final LocationRepository locationRepository;
    private final OrganizationRepository organizationRepository;
    private final DepartmentRepository departmentRepository;

    public LocationResponseDTO createLocation(CreateLocationRequestDTO request) {
        if (!organizationRepository.existsById(request.getOrganizationId())) {
            throw new ResourceNotFoundException("Organization not found: " + request.getOrganizationId());
        }

        if (locationRepository.existsByNameAndOrganizationId(request.getName(), request.getOrganizationId())) {
            throw new DuplicateResourceException(
                    "Location already exists with name: " + request.getName() + " for this organization");
        }

        Location location = Location.builder()
                .organizationId(request.getOrganizationId())
                .name(request.getName())
                .address(request.getAddress())
                .country(request.getCountry())
                .build();

        Location saved = locationRepository.save(location);

        return mapToDTO(saved);
    }

    public List<LocationResponseDTO> getAllLocations() {
        return locationRepository.findAll().stream()
                .map(this::mapToDTO)
                .toList();
    }

    public List<LocationResponseDTO> getLocationsByOrganization(Long organizationId) {
        if (!organizationRepository.existsById(organizationId)) {
            throw new ResourceNotFoundException("Organization not found: " + organizationId);
        }

        return locationRepository.findByOrganizationId(organizationId).stream()
                .map(this::mapToDTO)
                .toList();
    }

    public LocationResponseDTO getLocationById(Long id) {
        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Location not found with id: " + id));

        return mapToDTO(location);
    }

    public LocationResponseDTO updateLocation(Long id, CreateLocationRequestDTO request) {
        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Location not found with id: " + id));

        String newName = request.getName();
        if (!newName.equals(location.getName())
                && locationRepository.existsByNameAndOrganizationId(newName, location.getOrganizationId())) {
            throw new DuplicateResourceException(
                    "Location already exists with name: " + newName + " for this organization");
        }

        location.setName(newName);
        location.setAddress(request.getAddress());
        location.setCountry(request.getCountry());

        Location saved = locationRepository.save(location);

        return mapToDTO(saved);
    }

    public void deleteLocation(Long id) {
        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Location not found with id: " + id));

        if (departmentRepository.existsByLocationId(id)) {
            throw new DuplicateResourceException(
                    "Cannot delete location: departments still exist. Delete departments first.");
        }

        locationRepository.delete(location);
    }

    private LocationResponseDTO mapToDTO(Location location) {
        return LocationResponseDTO.builder()
                .id(location.getId())
                .organizationId(location.getOrganizationId())
                .name(location.getName())
                .address(location.getAddress())
                .country(location.getCountry())
                .createdAt(location.getCreatedAt())
                .build();
    }
}
