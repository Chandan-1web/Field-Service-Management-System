package com.fieldservicemanagement.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
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
@RequestMapping("/api")
public class PartUsageController {

    private final PartUsageService partUsageService;
    private final UserRepository userRepository;

    public PartUsageController(
            PartUsageService partUsageService,
            UserRepository userRepository) {

        this.partUsageService = partUsageService;
        this.userRepository = userRepository;
    }

    // =========================================================
    // RECORD PART USAGE
    // =========================================================

    @PostMapping(
            "/work-orders/{workOrderId}/parts"
    )
    @PreAuthorize(
            "hasAnyRole('TECHNICIAN', 'MANAGER')"
    )
    public ResponseEntity<PartUsageResponse> usePart(
            @PathVariable Long workOrderId,
            @Valid @RequestBody PartUsageRequest request,
            Authentication authentication) {

        User currentUser =
                getCurrentUser(authentication);

        PartUsageResponse response =
                partUsageService.usePart(
                        workOrderId,
                        request,
                        currentUser
                );

        return ResponseEntity.ok(response);
    }

    // =========================================================
    // GET PART USAGE FOR WORK ORDER
    // =========================================================

    @GetMapping(
            "/work-orders/{workOrderId}/parts"
    )
    @PreAuthorize(
            "hasAnyRole('TECHNICIAN', 'DISPATCHER', 'MANAGER')"
    )
    public ResponseEntity<List<PartUsageResponse>>
            getByWorkOrder(
                    @PathVariable Long workOrderId,
                    Authentication authentication) {

        User currentUser =
                getCurrentUser(authentication);

        return ResponseEntity.ok(
                partUsageService.getByWorkOrder(
                        workOrderId,
                        currentUser
                )
        );
    }

    // =========================================================
    // TECHNICIAN - GET MY PART USAGE
    // =========================================================

    @GetMapping("/part-usage/my")
    @PreAuthorize(
            "hasRole('TECHNICIAN')"
    )
    public ResponseEntity<List<PartUsageResponse>>
            getMyPartUsage(
                    Authentication authentication) {

        User currentUser =
                getCurrentUser(authentication);

        return ResponseEntity.ok(
                partUsageService.getMyPartUsage(
                        currentUser
                )
        );
    }

    // =========================================================
    // CURRENT USER
    // =========================================================

    private User getCurrentUser(
            Authentication authentication) {

        return userRepository
                .findByEmail(
                        authentication.getName()
                )
                .orElseThrow(() ->
                        new RuntimeException(
                                "Logged-in user not found"
                        )
                );
    }
}