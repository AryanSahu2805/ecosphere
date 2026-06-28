package com.EcoSphere.Backend.service;

import com.EcoSphere.Backend.dto.CreateEnergyRecordRequestDTO;
import com.EcoSphere.Backend.dto.EnergyRecordResponseDTO;
import com.EcoSphere.Backend.exception.ResourceNotFoundException;
import com.EcoSphere.Backend.model.EnergyRecord;
import com.EcoSphere.Backend.model.User;
import com.EcoSphere.Backend.repository.DepartmentRepository;
import com.EcoSphere.Backend.repository.EnergyRecordRepository;
import com.EcoSphere.Backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EnergyRecordService {

    private final EnergyRecordRepository energyRecordRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;

    public EnergyRecordResponseDTO createEnergyRecord(CreateEnergyRecordRequestDTO request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

        if (!departmentRepository.existsById(request.getDepartmentId())) {
            throw new ResourceNotFoundException("Department not found: " + request.getDepartmentId());
        }

        EnergyRecord record = EnergyRecord.builder()
                .departmentId(request.getDepartmentId())
                .userId(user.getId())
                .consumptionKwh(request.getConsumptionKwh())
                .energyType(request.getEnergyType())
                .co2Emission(BigDecimal.ZERO)
                .recordedDate(request.getRecordedDate())
                .notes(request.getNotes())
                .build();

        EnergyRecord saved = energyRecordRepository.save(record);

        return mapToDTO(saved);
    }

    public List<EnergyRecordResponseDTO> getAllEnergyRecords() {
        return energyRecordRepository.findAll().stream()
                .map(this::mapToDTO)
                .toList();
    }

    public List<EnergyRecordResponseDTO> getEnergyRecordsByDepartment(Long departmentId) {
        if (!departmentRepository.existsById(departmentId)) {
            throw new ResourceNotFoundException("Department not found: " + departmentId);
        }

        return energyRecordRepository.findByDepartmentId(departmentId).stream()
                .map(this::mapToDTO)
                .toList();
    }

    public EnergyRecordResponseDTO getEnergyRecordById(Long id) {
        EnergyRecord record = energyRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Energy record not found with id: " + id));

        return mapToDTO(record);
    }

    public EnergyRecordResponseDTO updateEnergyRecord(Long id, CreateEnergyRecordRequestDTO request) {
        EnergyRecord record = energyRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Energy record not found with id: " + id));

        record.setConsumptionKwh(request.getConsumptionKwh());
        record.setEnergyType(request.getEnergyType());
        record.setRecordedDate(request.getRecordedDate());
        record.setNotes(request.getNotes());
        record.setCo2Emission(BigDecimal.ZERO);

        EnergyRecord saved = energyRecordRepository.save(record);

        return mapToDTO(saved);
    }

    public void deleteEnergyRecord(Long id) {
        EnergyRecord record = energyRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Energy record not found with id: " + id));

        energyRecordRepository.delete(record);
    }

    private EnergyRecordResponseDTO mapToDTO(EnergyRecord record) {
        return EnergyRecordResponseDTO.builder()
                .id(record.getId())
                .departmentId(record.getDepartmentId())
                .userId(record.getUserId())
                .consumptionKwh(record.getConsumptionKwh())
                .energyType(record.getEnergyType())
                .co2Emission(record.getCo2Emission())
                .recordedDate(record.getRecordedDate())
                .notes(record.getNotes())
                .createdAt(record.getCreatedAt())
                .build();
    }
}
