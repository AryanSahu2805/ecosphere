package com.EcoSphere.Backend.service;

import com.EcoSphere.Backend.dto.CreateGoalRequestDTO;
import com.EcoSphere.Backend.dto.GoalProgressDTO;
import com.EcoSphere.Backend.dto.GoalResponseDTO;
import com.EcoSphere.Backend.exception.DuplicateResourceException;
import com.EcoSphere.Backend.exception.ResourceNotFoundException;
import com.EcoSphere.Backend.model.SustainabilityGoal;
import com.EcoSphere.Backend.model.User;
import com.EcoSphere.Backend.repository.DepartmentRepository;
import com.EcoSphere.Backend.repository.EnergyRecordRepository;
import com.EcoSphere.Backend.repository.LocationRepository;
import com.EcoSphere.Backend.repository.OrganizationRepository;
import com.EcoSphere.Backend.repository.ServerUsageRecordRepository;
import com.EcoSphere.Backend.repository.SustainabilityGoalRepository;
import com.EcoSphere.Backend.repository.TravelRecordRepository;
import com.EcoSphere.Backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GoalService {

    private static final BigDecimal HUNDRED = BigDecimal.valueOf(100);

    private final SustainabilityGoalRepository sustainabilityGoalRepository;
    private final OrganizationRepository organizationRepository;
    private final LocationRepository locationRepository;
    private final DepartmentRepository departmentRepository;
    private final EnergyRecordRepository energyRecordRepository;
    private final TravelRecordRepository travelRecordRepository;
    private final ServerUsageRecordRepository serverUsageRecordRepository;
    private final UserRepository userRepository;

    public GoalResponseDTO createGoal(CreateGoalRequestDTO request) {
        if (!organizationRepository.existsById(request.getOrganizationId())) {
            throw new ResourceNotFoundException("Organization not found: " + request.getOrganizationId());
        }

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

        BigDecimal baselineValue = getCurrentEmissions(
                request.getOrganizationId(),
                request.getTargetMetric(),
                LocalDate.of(2020, 1, 1),
                LocalDate.now());

        SustainabilityGoal goal = SustainabilityGoal.builder()
                .organizationId(request.getOrganizationId())
                .targetMetric(request.getTargetMetric())
                .targetValue(request.getTargetValue())
                .baselineValue(baselineValue)
                .deadline(request.getDeadline())
                .status("ACTIVE")
                .description(request.getDescription())
                .createdBy(user.getId())
                .build();

        SustainabilityGoal saved = sustainabilityGoalRepository.save(goal);

        return mapToDTO(saved);
    }

    public List<GoalResponseDTO> getAllGoals() {
        return sustainabilityGoalRepository.findAll().stream()
                .map(this::mapToDTO)
                .toList();
    }

    public List<GoalResponseDTO> getGoalsByOrganization(Long organizationId) {
        if (!organizationRepository.existsById(organizationId)) {
            throw new ResourceNotFoundException("Organization not found: " + organizationId);
        }

        return sustainabilityGoalRepository.findByOrganizationId(organizationId).stream()
                .map(this::mapToDTO)
                .toList();
    }

    public GoalResponseDTO getGoalById(Long id) {
        SustainabilityGoal goal = sustainabilityGoalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found with id: " + id));

        return mapToDTO(goal);
    }

    public GoalProgressDTO getGoalProgress(Long id) {
        SustainabilityGoal goal = sustainabilityGoalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found with id: " + id));

        BigDecimal currentValue = getCurrentEmissions(
                goal.getOrganizationId(),
                goal.getTargetMetric(),
                goal.getCreatedAt().toLocalDate(),
                LocalDate.now());

        BigDecimal reductionAchieved = goal.getBaselineValue().subtract(currentValue);
        if (reductionAchieved.compareTo(BigDecimal.ZERO) < 0) {
            reductionAchieved = BigDecimal.ZERO;
        }

        BigDecimal reductionNeeded = currentValue.subtract(goal.getTargetValue());
        if (reductionNeeded.compareTo(BigDecimal.ZERO) < 0) {
            reductionNeeded = BigDecimal.ZERO;
        }

        BigDecimal totalReductionRequired = goal.getBaselineValue().subtract(goal.getTargetValue());

        BigDecimal progressPercentage;
        if (totalReductionRequired.compareTo(BigDecimal.ZERO) <= 0) {
            progressPercentage = HUNDRED.setScale(2, RoundingMode.HALF_UP);
        } else {
            progressPercentage = reductionAchieved
                    .multiply(HUNDRED)
                    .divide(totalReductionRequired, 4, RoundingMode.HALF_UP);
            progressPercentage = progressPercentage.min(HUNDRED).max(BigDecimal.ZERO);
            progressPercentage = progressPercentage.setScale(2, RoundingMode.HALF_UP);
        }

        long daysRemaining = ChronoUnit.DAYS.between(LocalDate.now(), goal.getDeadline());

        boolean achieved = currentValue.compareTo(goal.getTargetValue()) <= 0;
        boolean missed = daysRemaining < 0 && currentValue.compareTo(goal.getTargetValue()) > 0;

        if ("ACTIVE".equals(goal.getStatus())) {
            if (achieved) {
                goal.setStatus("ACHIEVED");
                sustainabilityGoalRepository.save(goal);
            } else if (missed) {
                goal.setStatus("MISSED");
                sustainabilityGoalRepository.save(goal);
            }
        }

        boolean onTrack;
        if (daysRemaining <= 0) {
            onTrack = achieved;
        } else {
            long totalDays = ChronoUnit.DAYS.between(goal.getCreatedAt().toLocalDate(), goal.getDeadline());
            long elapsedDays = ChronoUnit.DAYS.between(goal.getCreatedAt().toLocalDate(), LocalDate.now());

            if (totalDays <= 0) {
                onTrack = achieved;
            } else {
                BigDecimal timeElapsedPct = BigDecimal.valueOf(elapsedDays)
                        .multiply(HUNDRED)
                        .divide(BigDecimal.valueOf(totalDays), 4, RoundingMode.HALF_UP);
                onTrack = progressPercentage.compareTo(timeElapsedPct) >= 0;
            }
        }

        return GoalProgressDTO.builder()
                .goalId(goal.getId())
                .organizationId(goal.getOrganizationId())
                .targetMetric(goal.getTargetMetric())
                .targetValue(goal.getTargetValue())
                .baselineValue(goal.getBaselineValue())
                .currentValue(currentValue)
                .reductionAchieved(reductionAchieved)
                .reductionNeeded(reductionNeeded)
                .progressPercentage(progressPercentage)
                .deadline(goal.getDeadline())
                .daysRemaining(daysRemaining)
                .status(goal.getStatus())
                .onTrack(onTrack)
                .build();
    }

    public void cancelGoal(Long id) {
        SustainabilityGoal goal = sustainabilityGoalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found with id: " + id));

        if (!"ACTIVE".equals(goal.getStatus())) {
            throw new DuplicateResourceException(
                    "Cannot cancel goal: status is " + goal.getStatus() + ", expected ACTIVE");
        }

        goal.setStatus("CANCELLED");
        sustainabilityGoalRepository.save(goal);
    }

    private BigDecimal getCurrentEmissions(Long organizationId, String metric, LocalDate from, LocalDate to) {
        List<Long> locationIds = locationRepository.findIdsByOrganizationId(organizationId);
        if (locationIds.isEmpty()) {
            return BigDecimal.ZERO;
        }

        List<Long> departmentIds = departmentRepository.findIdsByLocationIdIn(locationIds);
        if (departmentIds.isEmpty()) {
            return BigDecimal.ZERO;
        }

        return switch (metric) {
            case "ENERGY_EMISSIONS" -> energyRecordRepository.sumCo2ByDepartmentIds(departmentIds, from, to);
            case "TRAVEL_EMISSIONS" -> travelRecordRepository.sumCo2ByDepartmentIds(departmentIds, from, to);
            case "SERVER_EMISSIONS" -> serverUsageRecordRepository.sumCo2ByDepartmentIds(departmentIds, from, to);
            case "TOTAL_EMISSIONS" -> energyRecordRepository.sumCo2ByDepartmentIds(departmentIds, from, to)
                    .add(travelRecordRepository.sumCo2ByDepartmentIds(departmentIds, from, to))
                    .add(serverUsageRecordRepository.sumCo2ByDepartmentIds(departmentIds, from, to));
            default -> BigDecimal.ZERO;
        };
    }

    private GoalResponseDTO mapToDTO(SustainabilityGoal goal) {
        return GoalResponseDTO.builder()
                .id(goal.getId())
                .organizationId(goal.getOrganizationId())
                .targetMetric(goal.getTargetMetric())
                .targetValue(goal.getTargetValue())
                .baselineValue(goal.getBaselineValue())
                .deadline(goal.getDeadline())
                .status(goal.getStatus())
                .description(goal.getDescription())
                .createdBy(goal.getCreatedBy())
                .createdAt(goal.getCreatedAt())
                .build();
    }
}
