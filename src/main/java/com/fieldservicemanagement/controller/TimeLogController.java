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

import com.fieldservicemanagement.dto.TimeLogRequest;
import com.fieldservicemanagement.dto.TimeLogResponse;
import com.fieldservicemanagement.entity.User;
import com.fieldservicemanagement.repository.UserRepository;
import com.fieldservicemanagement.service.TimeLogService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/work-orders")
public class TimeLogController {

    private final TimeLogService timeLogService;
    private final UserRepository userRepository;

    public TimeLogController(
            TimeLogService timeLogService,
            UserRepository userRepository) {

        this.timeLogService = timeLogService;
        this.userRepository = userRepository;
    }

    @PostMapping("/{workOrderId}/time-logs")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<TimeLogResponse> logTime(
            @PathVariable Long workOrderId,
            @Valid @RequestBody TimeLogRequest request,
            Authentication authentication) {

        User currentUser = getCurrentUser(authentication);

        TimeLogResponse response = timeLogService.logTime(
                workOrderId,
                request,
                currentUser
        );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{workOrderId}/time-logs")
    @PreAuthorize("hasAnyRole('TECHNICIAN', 'DISPATCHER', 'MANAGER')")
    public ResponseEntity<List<TimeLogResponse>> getTimeLogs(
            @PathVariable Long workOrderId,
            Authentication authentication) {

        User currentUser = getCurrentUser(authentication);

        List<TimeLogResponse> response =
                timeLogService.getByWorkOrder(
                        workOrderId,
                        currentUser
                );

        return ResponseEntity.ok(response);
    }

    private User getCurrentUser(Authentication authentication) {

        return userRepository
                .findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Logged-in user not found"
                        )
                );
    }
}