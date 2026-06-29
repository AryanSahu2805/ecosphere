package com.EcoSphere.Backend.aspect;

import com.EcoSphere.Backend.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;

@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class AuditLogAspect {

    private final AuditLogService auditLogService;

    @AfterReturning(
            pointcut = "execution(* com.EcoSphere.Backend.service.*Service.create*(..)) || "
                    + "execution(* com.EcoSphere.Backend.service.*Service.update*(..)) || "
                    + "execution(* com.EcoSphere.Backend.service.*Service.delete*(..))",
            returning = "result"
    )
    public void logServiceOperation(JoinPoint joinPoint, Object result) {
        String methodName = joinPoint.getSignature().getName();

        try {
            String action;
            if (methodName.startsWith("create")) {
                action = "CREATE";
            } else if (methodName.startsWith("update")) {
                action = "UPDATE";
            } else if (methodName.startsWith("delete")) {
                action = "DELETE";
            } else if (methodName.startsWith("cancel")) {
                action = "DELETE";
            } else {
                return;
            }

            String className = joinPoint.getTarget().getClass().getSimpleName();
            String entityType = resolveEntityType(className);
            if (entityType == null) {
                return;
            }

            Long entityId = resolveEntityId(result);

            String details = "Method: " + joinPoint.getSignature().toShortString();

            auditLogService.log(action, entityType, entityId, details);
        } catch (Exception e) {
            log.warn("Failed to create audit log for {}: {}", methodName, e.getMessage());
        }
    }

    private String resolveEntityType(String className) {
        if ("EmissionCalculationService".equals(className)) {
            return null;
        }

        String raw = className.replace("Service", "").toUpperCase();

        return switch (raw) {
            case "ENERGYRECORD" -> "ENERGY_RECORD";
            case "TRAVELRECORD" -> "TRAVEL_RECORD";
            case "SERVERUSAGERECORD" -> "SERVER_RECORD";
            case "SUSTAINABILITYGOAL" -> "GOAL";
            default -> raw;
        };
    }

    private Long resolveEntityId(Object result) {
        if (result == null) {
            return null;
        }

        try {
            Method getIdMethod = result.getClass().getMethod("getId");
            Object id = getIdMethod.invoke(result);
            return id != null ? ((Number) id).longValue() : null;
        } catch (Exception e) {
            return null;
        }
    }
}
