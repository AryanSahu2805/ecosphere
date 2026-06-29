package com.EcoSphere.Backend.config;

import com.EcoSphere.Backend.model.EmissionFactor;
import com.EcoSphere.Backend.repository.EmissionFactorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final EmissionFactorRepository emissionFactorRepository;

    @Override
    public void run(String... args) {
        if (emissionFactorRepository.count() != 0) {
            return;
        }

        LocalDateTime now = LocalDateTime.now();

        List<EmissionFactor> factors = List.of(
                EmissionFactor.builder()
                        .activityType("ELECTRICITY")
                        .category("ENERGY")
                        .factor(new BigDecimal("0.233100"))
                        .unit("kg CO2 per kWh")
                        .updatedAt(now)
                        .build(),
                EmissionFactor.builder()
                        .activityType("NATURAL_GAS")
                        .category("ENERGY")
                        .factor(new BigDecimal("0.202100"))
                        .unit("kg CO2 per kWh")
                        .updatedAt(now)
                        .build(),
                EmissionFactor.builder()
                        .activityType("RENEWABLE")
                        .category("ENERGY")
                        .factor(new BigDecimal("0.013000"))
                        .unit("kg CO2 per kWh")
                        .updatedAt(now)
                        .build(),
                EmissionFactor.builder()
                        .activityType("CAR")
                        .category("TRAVEL")
                        .factor(new BigDecimal("0.171000"))
                        .unit("kg CO2 per km")
                        .updatedAt(now)
                        .build(),
                EmissionFactor.builder()
                        .activityType("FLIGHT")
                        .category("TRAVEL")
                        .factor(new BigDecimal("0.255000"))
                        .unit("kg CO2 per km")
                        .updatedAt(now)
                        .build(),
                EmissionFactor.builder()
                        .activityType("TRAIN")
                        .category("TRAVEL")
                        .factor(new BigDecimal("0.041000"))
                        .unit("kg CO2 per km")
                        .updatedAt(now)
                        .build(),
                EmissionFactor.builder()
                        .activityType("BUS")
                        .category("TRAVEL")
                        .factor(new BigDecimal("0.089000"))
                        .unit("kg CO2 per km")
                        .updatedAt(now)
                        .build(),
                EmissionFactor.builder()
                        .activityType("PHYSICAL")
                        .category("SERVER")
                        .factor(new BigDecimal("0.065000"))
                        .unit("kg CO2 per hour")
                        .updatedAt(now)
                        .build(),
                EmissionFactor.builder()
                        .activityType("CLOUD")
                        .category("SERVER")
                        .factor(new BigDecimal("0.045000"))
                        .unit("kg CO2 per hour")
                        .updatedAt(now)
                        .build(),
                EmissionFactor.builder()
                        .activityType("HYBRID")
                        .category("SERVER")
                        .factor(new BigDecimal("0.055000"))
                        .unit("kg CO2 per hour")
                        .updatedAt(now)
                        .build()
        );

        emissionFactorRepository.saveAll(factors);

        log.info("Emission factors seeded: {} records", factors.size());
    }
}
