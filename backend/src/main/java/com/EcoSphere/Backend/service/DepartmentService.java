package com.EcoSphere.Backend.service;

import com.EcoSphere.Backend.dto.CreateDepartmentRequestDTO;
import com.EcoSphere.Backend.dto.DepartmentResponseDTO;
import com.EcoSphere.Backend.exception.DuplicateResourceException;
import com.EcoSphere.Backend.exception.ResourceNotFoundException;
import com.EcoSphere.Backend.model.Department;
import com.EcoSphere.Backend.repository.DepartmentRepository;
import com.EcoSphere.Backend.repository.LocationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final LocationRepository locationRepository;

    public DepartmentResponseDTO createDepartment(CreateDepartmentRequestDTO request) {
        if (!locationRepository.existsById(request.getLocationId())) {
            throw new ResourceNotFoundException("Location not found: " + request.getLocationId());
        }

        if (departmentRepository.existsByNameAndLocationId(request.getName(), request.getLocationId())) {
            throw new DuplicateResourceException(
                    "Department already exists with name: " + request.getName() + " for this location");
        }

        Department department = Department.builder()
                .locationId(request.getLocationId())
                .name(request.getName())
                .build();

        Department saved = departmentRepository.save(department);

        return mapToDTO(saved);
    }

    public List<DepartmentResponseDTO> getAllDepartments() {
        return departmentRepository.findAll().stream()
                .map(this::mapToDTO)
                .toList();
    }

    public List<DepartmentResponseDTO> getDepartmentsByLocation(Long locationId) {
        if (!locationRepository.existsById(locationId)) {
            throw new ResourceNotFoundException("Location not found: " + locationId);
        }

        return departmentRepository.findByLocationId(locationId).stream()
                .map(this::mapToDTO)
                .toList();
    }

    public DepartmentResponseDTO getDepartmentById(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));

        return mapToDTO(department);
    }

    public DepartmentResponseDTO updateDepartment(Long id, CreateDepartmentRequestDTO request) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));

        String newName = request.getName();
        if (!newName.equals(department.getName())
                && departmentRepository.existsByNameAndLocationId(newName, department.getLocationId())) {
            throw new DuplicateResourceException(
                    "Department already exists with name: " + newName + " for this location");
        }

        department.setName(newName);

        Department saved = departmentRepository.save(department);

        return mapToDTO(saved);
    }

    public void deleteDepartment(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));

        departmentRepository.delete(department);
    }

    private DepartmentResponseDTO mapToDTO(Department department) {
        return DepartmentResponseDTO.builder()
                .id(department.getId())
                .locationId(department.getLocationId())
                .name(department.getName())
                .createdAt(department.getCreatedAt())
                .build();
    }
}
