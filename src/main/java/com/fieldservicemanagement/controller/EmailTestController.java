package com.fieldservicemanagement.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fieldservicemanagement.service.EmailService;

@RestController
public class EmailTestController {

    private final EmailService emailService;

    public EmailTestController(EmailService emailService) {
        this.emailService = emailService;
    }

    @PostMapping("/api/test-email")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<String> sendTestEmail(
            @RequestParam String to) {

        emailService.sendSimpleEmail(
                to,
                "Field Service Management Test Email",
                "Congratulations! Email configuration is working successfully."
        );

        return ResponseEntity.ok(
                "Test email sent successfully to " + to
        );
    }
}