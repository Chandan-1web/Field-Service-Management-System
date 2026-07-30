package com.fieldservicemanagement.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fieldservicemanagement.dto.AssignmentRequest;
import com.fieldservicemanagement.dto.StatusTransitionRequest;
import com.fieldservicemanagement.dto.WorkOrderRequest;
import com.fieldservicemanagement.dto.WorkOrderResponse;
import com.fieldservicemanagement.entity.User;
import com.fieldservicemanagement.repository.UserRepository;
import com.fieldservicemanagement.service.WorkOrderService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/work-orders")
public class WorkOrderController {

    private final WorkOrderService workOrderService;
    private final UserRepository userRepository;

    public WorkOrderController(
            WorkOrderService workOrderService,
            UserRepository userRepository) {

        this.workOrderService = workOrderService;
        this.userRepository = userRepository;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('DISPATCHER', 'MANAGER')")
    public ResponseEntity<WorkOrderResponse> create(
            @Valid @RequestBody WorkOrderRequest request) {

        return ResponseEntity.ok(
                workOrderService.create(request)
        );
    }

    @GetMapping
    @PreAuthorize(
            "hasAnyRole('TECHNICIAN', 'DISPATCHER', 'MANAGER')"
    )
    public ResponseEntity<List<WorkOrderResponse>> getAll() {

        return ResponseEntity.ok(
                workOrderService.getAll()
        );
    }

    @GetMapping("/status/{status}")
    @PreAuthorize(
            "hasAnyRole('TECHNICIAN', 'DISPATCHER', 'MANAGER')"
    )
    public ResponseEntity<List<WorkOrderResponse>> getByStatus(
            @PathVariable String status) {

        return ResponseEntity.ok(
                workOrderService.getByStatus(status)
        );
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('DISPATCHER', 'MANAGER')")
    public ResponseEntity<Page<WorkOrderResponse>> search(
            @RequestParam(required = false)
            String keyword,

            @RequestParam(required = false)
            String status,

            @RequestParam(required = false)
            String priority,

            @RequestParam(required = false)
            Long customerId,

            @RequestParam(required = false)
            Long siteId,

            @RequestParam(required = false)
            Long technicianId,

            @RequestParam(required = false)
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE_TIME
            )
            LocalDateTime createdFrom,

            @RequestParam(required = false)
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE_TIME
            )
            LocalDateTime createdTo,

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "10")
            int size,

            @RequestParam(defaultValue = "createdAt")
            String sortBy,

            @RequestParam(defaultValue = "desc")
            String sortDirection) {

        return ResponseEntity.ok(
                workOrderService.search(
                        keyword,
                        status,
                        priority,
                        customerId,
                        siteId,
                        technicianId,
                        createdFrom,
                        createdTo,
                        page,
                        size,
                        sortBy,
                        sortDirection
                )
        );
    }

    @PostMapping("/{id}/status")
    @PreAuthorize(
            "hasAnyRole('TECHNICIAN', 'DISPATCHER', 'MANAGER')"
    )
    public ResponseEntity<WorkOrderResponse> transitionStatus(
            @PathVariable Long id,
            @Valid
            @RequestBody
            StatusTransitionRequest request,
            Authentication authentication) {

        User currentUser =
                getCurrentUser(authentication);

        WorkOrderResponse response =
                workOrderService.transitionStatus(
                        id,
                        request,
                        currentUser
                );

        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/assign")
    @PreAuthorize("hasAnyRole('DISPATCHER', 'MANAGER')")
    public ResponseEntity<WorkOrderResponse> assignTechnician(
            @PathVariable Long id,
            @Valid
            @RequestBody
            AssignmentRequest request,
            Authentication authentication) {

        User currentUser =
                getCurrentUser(authentication);

        WorkOrderResponse response =
                workOrderService.assignTechnician(
                        id,
                        request,
                        currentUser
                );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/my-jobs")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<List<WorkOrderResponse>> getMyJobs(
            Authentication authentication) {

        User currentUser =
                getCurrentUser(authentication);

        List<WorkOrderResponse> jobs =
                workOrderService
                        .getMyAssignedWorkOrders(currentUser);

        return ResponseEntity.ok(jobs);
    }

    @GetMapping("/{id}")
    @PreAuthorize(
            "hasAnyRole('TECHNICIAN', 'DISPATCHER', 'MANAGER')"
    )
    public ResponseEntity<WorkOrderResponse> getById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                workOrderService.getById(id)
        );
    }

    private User getCurrentUser(
            Authentication authentication) {

        return userRepository
                .findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Logged-in user not found"
                        )
                );
    }
}