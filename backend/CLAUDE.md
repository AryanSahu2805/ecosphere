# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

EcoSphere is an enterprise carbon intelligence platform that tracks emissions, sustainability goals, and ESG reporting across organizations, locations, and departments. This `backend/` directory is one part of a monorepo whose git root is the parent directory (`../`), which also contains `frontend/` (React) and `docs/` — both currently empty. The project is in its very early stages (skeleton/scaffolding only); no business logic, models, or persistence have been implemented yet.

## Tech stack

- Java 21, Spring Boot 4.1.0 (parent POM)
- Spring Data JPA, Spring Security, Spring Validation, Spring Web MVC
- MySQL (via `mysql-connector-j`), but no datasource is configured yet in `application.properties` — only `spring.application.name` is set
- Lombok (annotation processor wired into both compile and test-compile executions of `maven-compiler-plugin`)

## Build, run, and test

No Maven wrapper is checked in and `mvn` is not installed globally in this environment — confirm availability before running these, or use an IDE's bundled Maven:

```
mvn clean install          # build
mvn spring-boot:run        # run the app
mvn test                   # run all tests
mvn test -Dtest=BackendApplicationTests          # run a single test class
mvn test -Dtest=BackendApplicationTests#contextLoads  # run a single test method
```

## Architecture

Standard layered Spring Boot structure under `src/main/java/com/EcoSphere/Backend/`:

- `config/` — Spring configuration (`SecurityConfig.java` exists but is currently an empty file — no security rules are actually configured yet, so Spring Security's default behavior applies, i.e. all endpoints require authentication).
- `controller/` — REST controllers (only `HealthController` exists, exposing `GET /api/health`).
- `dto/`, `exception/`, `model/`, `repository/`, `service/` — currently empty, scaffolded for future work.

### Known package-naming inconsistency

The package declarations in the existing source files do not consistently match the `com.EcoSphere.Backend` directory tree, and do not match each other:

- `BackendApplication.java` (in `.../com/EcoSphere/Backend/`) declares `package EcoSphere.Backend;` (no `com.` prefix).
- `HealthController.java` (in `.../com/EcoSphere/Backend/controller/`) declares `package com.ecosphere.backend.controller;` (different casing, and a different base package than the application class).
- The test class `BackendApplicationTests` declares `package EcoSphere.Backend;` and lives under `src/test/java/EcoSphere/Backend/` (note: no `com/` segment in the test source tree at all, while main uses `com/EcoSphere/`).

Practical consequence: `@SpringBootApplication`'s default component scan is rooted at the main class's package and sub-packages. Since `HealthController` is declared under `com.ecosphere.backend.controller` — not a sub-package of `EcoSphere.Backend` — it is likely **not** picked up by component scanning as currently written, meaning `/api/health` probably does not actually get registered. When adding or fixing files in this codebase, settle on one consistent base package (matching the directory layout) rather than copying an existing file's package declaration verbatim.
