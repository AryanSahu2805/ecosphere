package com.EcoSphere.Backend.controller;

import com.EcoSphere.Backend.dto.EmailPreferencesDTO;
import com.EcoSphere.Backend.service.EmailPreferencesService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/email-preferences")
@RequiredArgsConstructor
public class EmailPreferencesController {

    private final EmailPreferencesService prefsService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EmailPreferencesDTO> get() {
        return ResponseEntity.ok(prefsService.getPreferences());
    }

    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EmailPreferencesDTO> update(@RequestBody EmailPreferencesDTO dto) {
        return ResponseEntity.ok(prefsService.updatePreferences(dto));
    }
}
