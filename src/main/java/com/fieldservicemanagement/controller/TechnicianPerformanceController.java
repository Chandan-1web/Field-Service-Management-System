package com.fieldservicemanagement.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fieldservicemanagement.dto.TechnicianPerformanceResponse;
import com.fieldservicemanagement.entity.User;
import com.fieldservicemanagement.repository.UserRepository;
import com.fieldservicemanagement.service.TechnicianPerformanceService;

@RestController
@RequestMapping("/api/reports/technicians")
public class TechnicianPerformanceController {

    private final TechnicianPerformanceService performanceService;
    private final UserRepository userRepository;

    public TechnicianPerformanceController(
            TechnicianPerformanceService performanceService,
            UserRepository userRepository) {

        this.performanceService = performanceService;
        this.userRepository = userRepository;
    }

    @GetMapping("/{technicianId}/performance")
    @PreAuthorize("hasAnyRole('MANAGER', 'DISPATCHER')")
    public ResponseEntity<TechnicianPerformanceResponse>
            getTechnicianPerformance(
                    @PathVariable Long technicianId) {

        TechnicianPerformanceResponse response =
                performanceService.getPerformance(
                        technicianId);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/me/performance")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<TechnicianPerformanceResponse>
            getMyPerformance(
                    Authentication authentication) {

        User currentUser = userRepository
                .findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Logged-in user not found"));

        TechnicianPerformanceResponse response =
                performanceService.getPerformance(
                        currentUser.getId());

        return ResponseEntity.ok(response);
    }
}