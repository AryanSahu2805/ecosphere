package com.EcoSphere.Backend.service;

import com.EcoSphere.Backend.dto.EmissionsSummaryDTO;
import com.EcoSphere.Backend.dto.MonthlyTrendDTO;
import com.EcoSphere.Backend.exception.ResourceNotFoundException;
import com.EcoSphere.Backend.repository.DepartmentRepository;
import com.EcoSphere.Backend.repository.EnergyRecordRepository;
import com.EcoSphere.Backend.repository.LocationRepository;
import com.EcoSphere.Backend.repository.OrganizationRepository;
import com.EcoSphere.Backend.repository.ServerUsageRecordRepository;
import com.EcoSphere.Backend.repository.TravelRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final OrganizationRepository organizationRepository;
    private final LocationRepository locationRepository;
    private final OrganizationService organizationService;
    private final DepartmentRepository departmentRepository;
    private final EnergyRecordRepository energyRecordRepository;
    private final TravelRecordRepository travelRecordRepository;
    private final ServerUsageRecordRepository serverUsageRecordRepository;

    public EmissionsSummaryDTO getEmissionsSummary(Long organizationId, LocalDate from, LocalDate to) {
        organizationService.verifyAccessToOrganization(organizationId);
        if (!organizationRepository.existsById(organizationId)) {
            throw new ResourceNotFoundException("Organization not found: " + organizationId);
        }

        List<Long> locationIds = locationRepository.findIdsByOrganizationId(organizationId);
        if (locationIds.isEmpty()) {
            return emptySummary(organizationId, from, to);
        }

        List<Long> departmentIds = departmentRepository.findIdsByLocationIdIn(locationIds);
        if (departmentIds.isEmpty()) {
            return emptySummary(organizationId, from, to);
        }

        BigDecimal energyTotal = energyRecordRepository.sumCo2ByDepartmentIds(departmentIds, from, to);
        BigDecimal travelTotal = travelRecordRepository.sumCo2ByDepartmentIds(departmentIds, from, to);
        BigDecimal serverTotal = serverUsageRecordRepository.sumCo2ByDepartmentIds(departmentIds, from, to);

        int energyCount = energyRecordRepository.countByDepartmentIds(departmentIds, from, to);
        int travelCount = travelRecordRepository.countByDepartmentIds(departmentIds, from, to);
        int serverCount = serverUsageRecordRepository.countByDepartmentIds(departmentIds, from, to);

        return EmissionsSummaryDTO.builder()
                .organizationId(organizationId)
                .fromDate(from)
                .toDate(to)
                .totalEnergyEmissions(energyTotal)
                .totalTravelEmissions(travelTotal)
                .totalServerEmissions(serverTotal)
                .totalEmissions(energyTotal.add(travelTotal).add(serverTotal))
                .energyRecordCount(energyCount)
                .travelRecordCount(travelCount)
                .serverRecordCount(serverCount)
                .build();
    }

    public List<MonthlyTrendDTO> getMonthlyTrends(Long organizationId, int year) {
        organizationService.verifyAccessToOrganization(organizationId);
        if (!organizationRepository.existsById(organizationId)) {
            throw new ResourceNotFoundException("Organization not found: " + organizationId);
        }

        List<Long> locationIds = locationRepository.findIdsByOrganizationId(organizationId);
        if (locationIds.isEmpty()) {
            return List.of();
        }

        List<Long> departmentIds = departmentRepository.findIdsByLocationIdIn(locationIds);
        if (departmentIds.isEmpty()) {
            return List.of();
        }

        Map<Integer, BigDecimal> energyByMonth = toMonthMap(
                energyRecordRepository.monthlyEmissionsByDepartmentIds(departmentIds, year));
        Map<Integer, BigDecimal> travelByMonth = toMonthMap(
                travelRecordRepository.monthlyEmissionsByDepartmentIds(departmentIds, year));
        Map<Integer, BigDecimal> serverByMonth = toMonthMap(
                serverUsageRecordRepository.monthlyEmissionsByDepartmentIds(departmentIds, year));

        List<MonthlyTrendDTO> trends = new ArrayList<>();

        for (int month = 1; month <= 12; month++) {
            BigDecimal energy = energyByMonth.getOrDefault(month, BigDecimal.ZERO);
            BigDecimal travel = travelByMonth.getOrDefault(month, BigDecimal.ZERO);
            BigDecimal server = serverByMonth.getOrDefault(month, BigDecimal.ZERO);

            boolean hasData = energy.compareTo(BigDecimal.ZERO) > 0
                    || travel.compareTo(BigDecimal.ZERO) > 0
                    || server.compareTo(BigDecimal.ZERO) > 0;

            if (!hasData) {
                continue;
            }

            trends.add(MonthlyTrendDTO.builder()
                    .year(year)
                    .month(month)
                    .monthName(Month.of(month).getDisplayName(TextStyle.FULL, Locale.ENGLISH))
                    .energyEmissions(energy)
                    .travelEmissions(travel)
                    .serverEmissions(server)
                    .totalEmissions(energy.add(travel).add(server))
                    .build());
        }

        return trends;
    }

    private Map<Integer, BigDecimal> toMonthMap(List<Object[]> rows) {
        Map<Integer, BigDecimal> map = new HashMap<>();
        for (Object[] row : rows) {
            int month = ((Number) row[1]).intValue();
            BigDecimal total = row[2] instanceof BigDecimal
                    ? (BigDecimal) row[2]
                    : new BigDecimal(row[2].toString());
            map.put(month, total);
        }
        return map;
    }

    private EmissionsSummaryDTO emptySummary(Long organizationId, LocalDate from, LocalDate to) {
        return EmissionsSummaryDTO.builder()
                .organizationId(organizationId)
                .fromDate(from)
                .toDate(to)
                .totalEnergyEmissions(BigDecimal.ZERO)
                .totalTravelEmissions(BigDecimal.ZERO)
                .totalServerEmissions(BigDecimal.ZERO)
                .totalEmissions(BigDecimal.ZERO)
                .energyRecordCount(0)
                .travelRecordCount(0)
                .serverRecordCount(0)
                .build();
    }
}
