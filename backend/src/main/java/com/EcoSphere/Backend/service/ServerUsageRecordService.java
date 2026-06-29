package com.EcoSphere.Backend.service;

import com.EcoSphere.Backend.dto.CreateServerUsageRecordRequestDTO;
import com.EcoSphere.Backend.dto.ServerUsageRecordResponseDTO;
import com.EcoSphere.Backend.exception.ResourceNotFoundException;
import com.EcoSphere.Backend.model.ServerUsageRecord;
import com.EcoSphere.Backend.model.User;
import com.EcoSphere.Backend.repository.DepartmentRepository;
import com.EcoSphere.Backend.repository.ServerUsageRecordRepository;
import com.EcoSphere.Backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ServerUsageRecordService {

    private final ServerUsageRecordRepository serverUsageRecordRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final EmissionCalculationService emissionCalculationService;

    public ServerUsageRecordResponseDTO createServerUsageRecord(CreateServerUsageRecordRequestDTO request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

        if (!departmentRepository.existsById(request.getDepartmentId())) {
            throw new ResourceNotFoundException("Department not found: " + request.getDepartmentId());
        }

        ServerUsageRecord record = ServerUsageRecord.builder()
                .departmentId(request.getDepartmentId())
                .userId(user.getId())
                .usageHours(request.getUsageHours())
                .serverType(request.getServerType())
                .co2Emission(emissionCalculationService
                        .calculateServerEmission(request.getUsageHours(), request.getServerType()))
                .recordedDate(request.getRecordedDate())
                .notes(request.getNotes())
                .build();

        ServerUsageRecord saved = serverUsageRecordRepository.save(record);

        return mapToDTO(saved);
    }

    public List<ServerUsageRecordResponseDTO> getAllServerUsageRecords() {
        return serverUsageRecordRepository.findAll().stream()
                .map(this::mapToDTO)
                .toList();
    }

    public List<ServerUsageRecordResponseDTO> getServerUsageRecordsByDepartment(Long departmentId) {
        if (!departmentRepository.existsById(departmentId)) {
            throw new ResourceNotFoundException("Department not found: " + departmentId);
        }

        return serverUsageRecordRepository.findByDepartmentId(departmentId).stream()
                .map(this::mapToDTO)
                .toList();
    }

    public ServerUsageRecordResponseDTO getServerUsageRecordById(Long id) {
        ServerUsageRecord record = serverUsageRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Server usage record not found with id: " + id));

        return mapToDTO(record);
    }

    public ServerUsageRecordResponseDTO updateServerUsageRecord(Long id, CreateServerUsageRecordRequestDTO request) {
        ServerUsageRecord record = serverUsageRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Server usage record not found with id: " + id));

        record.setUsageHours(request.getUsageHours());
        record.setServerType(request.getServerType());
        record.setRecordedDate(request.getRecordedDate());
        record.setNotes(request.getNotes());
        record.setCo2Emission(emissionCalculationService
                .calculateServerEmission(record.getUsageHours(), record.getServerType()));

        ServerUsageRecord saved = serverUsageRecordRepository.save(record);

        return mapToDTO(saved);
    }

    public void deleteServerUsageRecord(Long id) {
        ServerUsageRecord record = serverUsageRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Server usage record not found with id: " + id));

        serverUsageRecordRepository.delete(record);
    }

    private ServerUsageRecordResponseDTO mapToDTO(ServerUsageRecord record) {
        return ServerUsageRecordResponseDTO.builder()
                .id(record.getId())
                .departmentId(record.getDepartmentId())
                .userId(record.getUserId())
                .usageHours(record.getUsageHours())
                .serverType(record.getServerType())
                .co2Emission(record.getCo2Emission())
                .recordedDate(record.getRecordedDate())
                .notes(record.getNotes())
                .createdAt(record.getCreatedAt())
                .build();
    }
}
