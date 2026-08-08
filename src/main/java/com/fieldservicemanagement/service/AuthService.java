package com.fieldservicemanagement.service;

import java.time.LocalDateTime;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fieldservicemanagement.dto.CustomerRegisterRequest;
import com.fieldservicemanagement.dto.LoginRequest;
import com.fieldservicemanagement.dto.LoginResponse;
import com.fieldservicemanagement.entity.User;
import com.fieldservicemanagement.repository.UserRepository;
import com.fieldservicemanagement.security.JwtUtil;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
            AuthenticationManager authenticationManager,
            UserRepository userRepository,
            JwtUtil jwtUtil,
            PasswordEncoder passwordEncoder) {

        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
    }

    // =========================================================
    // LOGIN
    // =========================================================

    @Transactional
    public LoginResponse login(LoginRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = userRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"
                        )
                );

        user.setLastLogin(
                LocalDateTime.now()
        );

        userRepository.save(user);

        String token = jwtUtil.generateToken(
                user.getEmail(),
                user.getRole().name()
        );

        return new LoginResponse(
                token,
                user.getRole().name()
        );
    }

    // =========================================================
    // CUSTOMER REGISTRATION
    // =========================================================

   @Transactional
public User registerCustomer(
        CustomerRegisterRequest request) {

    // Check whether email already exists
    if (userRepository
            .findByEmail(request.getEmail().trim().toLowerCase())
            .isPresent()) {

        throw new IllegalStateException(
                "An account already exists with this email."
        );
    }

    User customer = new User();

    customer.setName(
            request.getName().trim()
    );

    customer.setEmail(
            request.getEmail()
                    .trim()
                    .toLowerCase()
    );

    customer.setPhoneNumber(
            request.getPhone().trim()
    );

    customer.setPasswordHash(
            passwordEncoder.encode(
                    request.getPassword()
            )
    );

    // Public registration ALWAYS creates a CUSTOMER.
    // The user cannot choose MANAGER/DISPATCHER/TECHNICIAN.
    customer.setRole(
            User.Role.CUSTOMER
    );

    customer.setActive(true);

    return userRepository.save(customer);
}
}