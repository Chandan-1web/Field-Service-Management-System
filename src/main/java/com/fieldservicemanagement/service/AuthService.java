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
import com.fieldservicemanagement.entity.Customer;
import com.fieldservicemanagement.entity.User;
import com.fieldservicemanagement.repository.CustomerRepository;
import com.fieldservicemanagement.repository.UserRepository;
import com.fieldservicemanagement.security.JwtUtil;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
            AuthenticationManager authenticationManager,
            UserRepository userRepository,
            CustomerRepository customerRepository,
            JwtUtil jwtUtil,
            PasswordEncoder passwordEncoder) {

        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.customerRepository = customerRepository;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
    }

    // =========================================================
    // LOGIN
    // =========================================================

    @Transactional
    public LoginResponse login(
            LoginRequest request) {

        String email =
                request.getEmail()
                        .trim()
                        .toLowerCase();

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        email,
                        request.getPassword()
                )
        );

        User user =
                userRepository
                        .findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found"
                                )
                        );

        user.setLastLogin(
                LocalDateTime.now()
        );

        userRepository.save(user);

        String token =
                jwtUtil.generateToken(
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

        String email =
                request.getEmail()
                        .trim()
                        .toLowerCase();

        // Prevent duplicate user account
        if (userRepository
                .findByEmail(email)
                .isPresent()) {

            throw new IllegalStateException(
                    "An account already exists with this email."
            );
        }

        // Prevent duplicate Customer record
        if (customerRepository
                .findByContactEmailIgnoreCase(email)
                .isPresent()) {

            throw new IllegalStateException(
                    "A customer already exists with this email."
            );
        }

        // -----------------------------------------------------
        // CREATE LOGIN USER
        // -----------------------------------------------------

        User customerUser =
                new User();

        customerUser.setName(
                request.getName().trim()
        );

        customerUser.setEmail(email);

        customerUser.setPhoneNumber(
                request.getPhone().trim()
        );

        customerUser.setPasswordHash(
                passwordEncoder.encode(
                        request.getPassword()
                )
        );

        customerUser.setRole(
                User.Role.CUSTOMER
        );

        customerUser.setActive(true);

        User savedUser =
                userRepository.save(
                        customerUser
                );

        // -----------------------------------------------------
        // CREATE SERVICE CUSTOMER RECORD
        // -----------------------------------------------------

        Customer customer =
                new Customer();

        customer.setName(
                request.getName().trim()
        );

        customer.setContactEmail(
                email
        );

        customer.setCreatedAt(
                LocalDateTime.now()
        );

        customerRepository.save(
                customer
        );

        return savedUser;
    }
}