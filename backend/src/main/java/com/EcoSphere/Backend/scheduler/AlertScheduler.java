package com.EcoSphere.Backend.scheduler;

import com.EcoSphere.Backend.dto.GoalProgressDTO;
import com.EcoSphere.Backend.model.SustainabilityGoal;
import com.EcoSphere.Backend.repository.DepartmentRepository;
import com.EcoSphere.Backend.repository.EnergyRecordRepository;
import com.EcoSphere.Backend.repository.LocationRepository;
import com.EcoSphere.Backend.repository.OrganizationRepository;
import com.EcoSphere.Backend.repository.ServerUsageRecordRepository;
import com.EcoSphere.Backend.repository.SustainabilityGoalRepository;
import com.EcoSphere.Backend.repository.TravelRecordRepository;
import com.EcoSphere.Backend.service.AlertService;
import com.EcoSphere.Backend.service.GoalService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class AlertScheduler {

    private final SustainabilityGoalRepository goalRepository;
    private final GoalService goalService;
    private final AlertService alertService;
    private final OrganizationRepository organizationRepository;
    private final LocationRepository locationRepository;
    private final DepartmentRepository departmentRepository;
    private final EnergyRecordRepository energyRecordRepository;
    private final TravelRecordRepository travelRecordRepository;
    private final ServerUsageRecordRepository serverUsageRecordRepository;

    @Scheduled(cron = "0 0 1 * * *")
    public void checkGoalsAndGenerateAlerts() {
        List<SustainabilityGoal> activeGoals = goalRepository.findByStatus("ACTIVE");

        for (SustainabilityGoal goal : activeGoals) {
            GoalProgressDTO progress = goalService.getGoalProgress(goal.getId());

            if (progress.getDaysRemaining() < 0
                    && progress.getCurrentValue().compareTo(goal.getTargetValue()) > 0) {
                alertService.createAlertIfNotExists(
                        goal.getOrganizationId(),
                        goal.getId(),
                        "GOAL_MISSED",
                        "Goal deadline passed without reaching target. "
                                + "Current: " + progress.getCurrentValue()
                                + " kg CO2, Target: " + goal.getTargetValue() + " kg CO2.",
                        "HIGH");
            } else if (progress.getDaysRemaining() >= 0
                    && progress.getDaysRemaining() <= 30
                    && !progress.isOnTrack()) {
                alertService.createAlertIfNotExists(
                        goal.getOrganizationId(),
                        goal.getId(),
                        "GOAL_AT_RISK",
                        "Goal deadline in " + progress.getDaysRemaining()
                                + " days but progress is behind schedule. "
                                + "Progress: " + progress.getProgressPercentage() + "%.",
                        "MEDIUM");
            }
        }

        List<Long> orgIds = activeGoals.stream()
                .map(SustainabilityGoal::getOrganizationId)
                .distinct()
                .toList();

        LocalDate today = LocalDate.now();
        LocalDate thisMonthStart = today.withDayOfMonth(1);
        LocalDate lastMonthStart = today.minusMonths(1).withDayOfMonth(1);
        LocalDate lastMonthEnd = thisMonthStart.minusDays(1);

        for (Long orgId : orgIds) {
            List<Long> locationIds = locationRepository.findIdsByOrganizationId(orgId);
            if (locationIds.isEmpty()) {
                continue;
            }

            List<Long> departmentIds = departmentRepository.findIdsByLocationIdIn(locationIds);
            if (departmentIds.isEmpty()) {
                continue;
            }

            BigDecimal thisPeriod = energyRecordRepository.sumCo2ByDepartmentIds(departmentIds, thisMonthStart, today)
                    .add(travelRecordRepository.sumCo2ByDepartmentIds(departmentIds, thisMonthStart, today))
                    .add(serverUsageRecordRepository.sumCo2ByDepartmentIds(departmentIds, thisMonthStart, today));

            BigDecimal lastPeriod = energyRecordRepository.sumCo2ByDepartmentIds(departmentIds, lastMonthStart, lastMonthEnd)
                    .add(travelRecordRepository.sumCo2ByDepartmentIds(departmentIds, lastMonthStart, lastMonthEnd))
                    .add(serverUsageRecordRepository.sumCo2ByDepartmentIds(departmentIds, lastMonthStart, lastMonthEnd));

            if (lastPeriod.compareTo(BigDecimal.ZERO) > 0
                    && thisPeriod.compareTo(lastPeriod.multiply(BigDecimal.valueOf(1.20))) > 0) {
                BigDecimal increasePercent = thisPeriod.subtract(lastPeriod)
                        .divide(lastPeriod, 2, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100));

                alertService.createAlertIfNotExists(
                        orgId,
                        null,
                        "EMISSION_SPIKE",
                        "Emissions this month (" + thisPeriod + " kg CO2) "
                                + "are " + increasePercent + "% higher than last month ("
                                + lastPeriod + " kg CO2).",
                        "MEDIUM");
            }
        }

        log.info("Alert scheduler completed. Checked {} goals, {} organizations.",
                activeGoals.size(), orgIds.size());
    }
}
