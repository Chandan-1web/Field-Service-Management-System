package com.fieldservicemanagement.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fieldservicemanagement.dto.LoginRequest;
import com.fieldservicemanagement.dto.LoginResponse;
import com.fieldservicemanagement.entity.User;
import com.fieldservicemanagement.service.AuthService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    public String me(@AuthenticationPrincipal User user) {
        return "Logged in as: " + user.getEmail() + " | Role: " + user.getRole();
    }
}