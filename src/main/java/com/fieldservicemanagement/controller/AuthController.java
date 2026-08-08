package com.fieldservicemanagement.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.fieldservicemanagement.dto.CustomerRegisterRequest;
import com.fieldservicemanagement.dto.LoginRequest;
import com.fieldservicemanagement.dto.LoginResponse;
import com.fieldservicemanagement.entity.User;
import com.fieldservicemanagement.service.AuthService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(
            AuthService authService) {

        this.authService = authService;
    }

    // =========================================================
    // LOGIN
    // =========================================================

    @PostMapping("/login")
    public LoginResponse login(
            @Valid
            @RequestBody
            LoginRequest request) {

        return authService.login(
                request
        );
    }

    // =========================================================
    // CUSTOMER REGISTRATION
    // =========================================================

    @PostMapping("/register/customer")
    public ResponseEntity<String>
            registerCustomer(
                    @Valid
                    @RequestBody
                    CustomerRegisterRequest request) {

        authService.registerCustomer(
                request
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        "Customer account created successfully."
                );
    }

    // =========================================================
    // CURRENT AUTHENTICATED USER
    // =========================================================

    @GetMapping("/me")
    public String me(
            @AuthenticationPrincipal
            User user) {

        if (user == null) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authentication is required"
            );
        }

        return "Logged in as: "
                + user.getEmail()
                + " | Role: "
                + user.getRole();
    }
}