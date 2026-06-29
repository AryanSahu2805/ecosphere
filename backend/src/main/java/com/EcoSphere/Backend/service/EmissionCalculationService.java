package com.EcoSphere.Backend.service;

import com.EcoSphere.Backend.model.EmissionFactor;
import com.EcoSphere.Backend.repository.EmissionFactorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@RequiredArgsConstructor
public class EmissionCalculationService {

    private final EmissionFactorRepository emissionFactorRepository;

    public BigDecimal calculateEnergyEmission(BigDecimal consumptionKwh, String energyType) {
        return calculate(consumptionKwh, energyType);
    }

    public BigDecimal calculateTravelEmission(BigDecimal distanceKm, String transportMode) {
        return calculate(distanceKm, transportMode);
    }

    public BigDecimal calculateServerEmission(BigDecimal usageHours, String serverType) {
        return calculate(usageHours, serverType);
    }

    private BigDecimal calculate(BigDecimal quantity, String activityType) {
        return emissionFactorRepository.findByActivityType(activityType.toUpperCase())
                .map(EmissionFactor::getFactor)
                .map(factor -> quantity.multiply(factor).setScale(4, RoundingMode.HALF_UP))
                .orElse(BigDecimal.ZERO);
    }
}
