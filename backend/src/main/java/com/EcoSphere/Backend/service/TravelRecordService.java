package com.EcoSphere.Backend.service;

import com.EcoSphere.Backend.dto.CreateTravelRecordRequestDTO;
import com.EcoSphere.Backend.dto.TravelRecordResponseDTO;
import com.EcoSphere.Backend.exception.ResourceNotFoundException;
import com.EcoSphere.Backend.model.TravelRecord;
import com.EcoSphere.Backend.model.User;
import com.EcoSphere.Backend.repository.DepartmentRepository;
import com.EcoSphere.Backend.repository.TravelRecordRepository;
import com.EcoSphere.Backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TravelRecordService {

    private final TravelRecordRepository travelRecordRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final EmissionCalculationService emissionCalculationService;

    public TravelRecordResponseDTO createTravelRecord(CreateTravelRecordRequestDTO request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

        if (!departmentRepository.existsById(request.getDepartmentId())) {
            throw new ResourceNotFoundException("Department not found: " + request.getDepartmentId());
        }

        TravelRecord record = TravelRecord.builder()
                .departmentId(request.getDepartmentId())
                .userId(user.getId())
                .distanceKm(request.getDistanceKm())
                .transportMode(request.getTransportMode())
                .co2Emission(emissionCalculationService
                        .calculateTravelEmission(request.getDistanceKm(), request.getTransportMode()))
                .recordedDate(request.getRecordedDate())
                .notes(request.getNotes())
                .build();

        TravelRecord saved = travelRecordRepository.save(record);

        return mapToDTO(saved);
    }

    public List<TravelRecordResponseDTO> getAllTravelRecords() {
        return travelRecordRepository.findAll().stream()
                .map(this::mapToDTO)
                .toList();
    }

    public List<TravelRecordResponseDTO> getTravelRecordsByDepartment(Long departmentId) {
        if (!departmentRepository.existsById(departmentId)) {
            throw new ResourceNotFoundException("Department not found: " + departmentId);
        }

        return travelRecordRepository.findByDepartmentId(departmentId).stream()
                .map(this::mapToDTO)
                .toList();
    }

    public TravelRecordResponseDTO getTravelRecordById(Long id) {
        TravelRecord record = travelRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Travel record not found with id: " + id));

        return mapToDTO(record);
    }

    public TravelRecordResponseDTO updateTravelRecord(Long id, CreateTravelRecordRequestDTO request) {
        TravelRecord record = travelRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Travel record not found with id: " + id));

        record.setDistanceKm(request.getDistanceKm());
        record.setTransportMode(request.getTransportMode());
        record.setRecordedDate(request.getRecordedDate());
        record.setNotes(request.getNotes());
        record.setCo2Emission(emissionCalculationService
                .calculateTravelEmission(record.getDistanceKm(), record.getTransportMode()));

        TravelRecord saved = travelRecordRepository.save(record);

        return mapToDTO(saved);
    }

    public void deleteTravelRecord(Long id) {
        TravelRecord record = travelRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Travel record not found with id: " + id));

        travelRecordRepository.delete(record);
    }

    private TravelRecordResponseDTO mapToDTO(TravelRecord record) {
        return TravelRecordResponseDTO.builder()
                .id(record.getId())
                .departmentId(record.getDepartmentId())
                .userId(record.getUserId())
                .distanceKm(record.getDistanceKm())
                .transportMode(record.getTransportMode())
                .co2Emission(record.getCo2Emission())
                .recordedDate(record.getRecordedDate())
                .notes(record.getNotes())
                .createdAt(record.getCreatedAt())
                .build();
    }
}
