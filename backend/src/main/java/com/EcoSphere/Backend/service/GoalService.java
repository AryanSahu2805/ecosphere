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
import com.EcoSphere.Backend.repository.AlertRepository;
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

    private final SustainabilityGoalRepository sustainabilityGoalRepository;
    private final OrganizationRepository organizationRepository;
    private final LocationRepository locationRepository;
    private final DepartmentRepository departmentRepository;
    private final EnergyRecordRepository energyRecordRepository;
    private final TravelRecordRepository travelRecordRepository;
    private final ServerUsageRecordRepository serverUsageRecordRepository;
    private final UserRepository userRepository;
    private final AlertService alertService;
    private final AlertRepository alertRepository;
    private final OrganizationService organizationService;
    private final AnalyticsService analyticsService;

    public GoalResponseDTO createGoal(CreateGoalRequestDTO request) {
        if (!organizationRepository.existsById(request.getOrganizationId())) {
            throw new ResourceNotFoundException("Organization not found: " + request.getOrganizationId());
        }

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

        LocalDate today = LocalDate.now();
        LocalDate threeMonthsAgo = today.minusMonths(3);

        BigDecimal baselineMonthlyRate = analyticsService.getAverageMonthlyEmissions(
                request.getOrganizationId(),
                request.getTargetMetric(),
                threeMonthsAgo,
                today);

        if (baselineMonthlyRate.compareTo(BigDecimal.ZERO) == 0) {
            baselineMonthlyRate = analyticsService.getAverageMonthlyEmissions(
                    request.getOrganizationId(),
                    request.getTargetMetric(),
                    today.minusMonths(6),
                    today);
        }

        BigDecimal legacyBaseline = getCurrentEmissions(
                request.getOrganizationId(),
                request.getTargetMetric(),
                LocalDate.of(2020, 1, 1),
                today);

        SustainabilityGoal goal = SustainabilityGoal.builder()
                .organizationId(request.getOrganizationId())
                .targetMetric(request.getTargetMetric())
                .targetValue(request.getTargetValue())
                .baselineValue(legacyBaseline)
                .baselineMonthlyRate(baselineMonthlyRate)
                .goalType("RATE_REDUCTION")
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
        organizationService.verifyAccessToOrganization(organizationId);
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

        LocalDate today = LocalDate.now();
        LocalDate threeMonthsAgo = today.minusMonths(3);

        BigDecimal currentMonthlyRate = analyticsService.getAverageMonthlyEmissions(
                goal.getOrganizationId(),
                goal.getTargetMetric(),
                threeMonthsAgo,
                today);

        BigDecimal baselineRate = goal.getBaselineMonthlyRate();
        if (baselineRate == null || baselineRate.compareTo(BigDecimal.ZERO) == 0) {
            baselineRate = goal.getBaselineValue()
                    .divide(BigDecimal.valueOf(12), 4, RoundingMode.HALF_UP);
        }

        BigDecimal targetRate = goal.getTargetValue();

        BigDecimal totalReductionNeeded = baselineRate.subtract(targetRate);
        BigDecimal reductionAchieved = baselineRate.subtract(currentMonthlyRate);

        BigDecimal progressPercentage;
        if (totalReductionNeeded.compareTo(BigDecimal.ZERO) <= 0) {
            progressPercentage = new BigDecimal("100");
        } else {
            progressPercentage = reductionAchieved
                    .divide(totalReductionNeeded, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .min(new BigDecimal("100"))
                    .max(new BigDecimal("-999"));
        }
        progressPercentage = progressPercentage.setScale(2, RoundingMode.HALF_UP);

        long daysRemaining = ChronoUnit.DAYS.between(today, goal.getDeadline());

        boolean onTrack;
        if (daysRemaining < 0) {
            onTrack = currentMonthlyRate.compareTo(targetRate) <= 0;
        } else {
            long totalDays = ChronoUnit.DAYS.between(goal.getCreatedAt().toLocalDate(), goal.getDeadline());
            if (totalDays <= 0) {
                onTrack = false;
            } else {
                double timeElapsedPct = (double) (totalDays - daysRemaining) / totalDays * 100;
                onTrack = progressPercentage.doubleValue() >= timeElapsedPct;
            }
        }

        if ("ACTIVE".equals(goal.getStatus())) {
            if (currentMonthlyRate.compareTo(targetRate) <= 0) {
                goal.setStatus("ACHIEVED");
                sustainabilityGoalRepository.save(goal);
            } else if (daysRemaining < 0) {
                goal.setStatus("MISSED");
                sustainabilityGoalRepository.save(goal);
                alertService.createAlertIfNotExists(
                        goal.getOrganizationId(),
                        goal.getId(),
                        "GOAL_MISSED",
                        "Monthly emission rate ("
                                + currentMonthlyRate.setScale(2, RoundingMode.HALF_UP)
                                + " kg/month) exceeds target ("
                                + targetRate + " kg/month) and deadline passed.",
                        "HIGH");
            }
        }

        return GoalProgressDTO.builder()
                .goalId(goal.getId())
                .organizationId(goal.getOrganizationId())
                .targetMetric(goal.getTargetMetric())
                .targetValue(targetRate)
                .baselineValue(baselineRate)
                .currentValue(currentMonthlyRate)
                .reductionAchieved(reductionAchieved)
                .reductionNeeded(currentMonthlyRate.subtract(targetRate).max(BigDecimal.ZERO))
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

    public void deleteGoal(Long id) {
        SustainabilityGoal goal = sustainabilityGoalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found: " + id));

        if ("ACTIVE".equals(goal.getStatus())) {
            throw new DuplicateResourceException(
                    "Cannot delete an active goal. Cancel it first.");
        }

        alertRepository.deleteAll(
                alertRepository.findByOrganizationId(goal.getOrganizationId())
                        .stream()
                        .filter(a -> goal.getId().equals(a.getGoalId()))
                        .toList()
        );

        sustainabilityGoalRepository.delete(goal);
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
