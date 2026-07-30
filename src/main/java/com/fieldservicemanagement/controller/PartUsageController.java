package com.fieldservicemanagement.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fieldservicemanagement.dto.PartUsageRequest;
import com.fieldservicemanagement.dto.PartUsageResponse;
import com.fieldservicemanagement.entity.User;
import com.fieldservicemanagement.repository.UserRepository;
import com.fieldservicemanagement.service.PartUsageService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/work-orders")
public class PartUsageController {

    private final PartUsageService partUsageService;
    private final UserRepository userRepository;

    public PartUsageController(
            PartUsageService partUsageService,
            UserRepository userRepository) {

        this.partUsageService = partUsageService;
        this.userRepository = userRepository;
    }

    @PostMapping("/{workOrderId}/parts")
    @PreAuthorize("hasAnyRole('TECHNICIAN', 'MANAGER')")
    public ResponseEntity<PartUsageResponse> usePart(
            @PathVariable Long workOrderId,
            @Valid @RequestBody PartUsageRequest request,
            Authentication authentication) {

        User currentUser = userRepository
                .findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Logged-in user not found"
                        )
                );

        PartUsageResponse response =
                partUsageService.usePart(
                        workOrderId,
                        request,
                        currentUser
                );

        return ResponseEntity.ok(response);
    }
}