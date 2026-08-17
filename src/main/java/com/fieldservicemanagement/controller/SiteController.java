package com.fieldservicemanagement.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fieldservicemanagement.dto.SiteRequest;
import com.fieldservicemanagement.dto.SiteResponse;
import com.fieldservicemanagement.entity.Customer;
import com.fieldservicemanagement.entity.User;
import com.fieldservicemanagement.repository.CustomerRepository;
import com.fieldservicemanagement.repository.UserRepository;
import com.fieldservicemanagement.service.SiteService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
public class SiteController {

    private final SiteService siteService;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;

    public SiteController(
            SiteService siteService,
            CustomerRepository customerRepository,
            UserRepository userRepository) {

        this.siteService = siteService;
        this.customerRepository = customerRepository;
        this.userRepository = userRepository;
    }

    // =========================================================
    // MANAGER / DISPATCHER - CREATE SITE
    // =========================================================

    @PostMapping("/customers/{customerId}/sites")
    @PreAuthorize(
            "hasAnyRole('DISPATCHER', 'MANAGER')"
    )
    public SiteResponse create(
            @PathVariable Long customerId,
            @Valid
            @RequestBody
            SiteRequest request) {

        request.setCustomerId(customerId);

        return siteService.create(request);
    }

    // =========================================================
    // MANAGER / DISPATCHER - CUSTOMER SITES
    // =========================================================

    @GetMapping("/customers/{customerId}/sites")
    @PreAuthorize(
            "hasAnyRole('DISPATCHER', 'MANAGER')"
    )
    public List<SiteResponse> getByCustomer(
            @PathVariable Long customerId) {

        return siteService.getByCustomer(
                customerId
        );
    }

    // =========================================================
    // MANAGER / DISPATCHER - ALL SITES
    // =========================================================

    @GetMapping("/sites")
    @PreAuthorize(
            "hasAnyRole('DISPATCHER', 'MANAGER')"
    )
    public List<SiteResponse> getAll() {

        return siteService.getAll();
    }

    // =========================================================
    // CUSTOMER - MY SITES
    // =========================================================

    @GetMapping("/customer/sites")
    public List<SiteResponse> getMySites(
            Authentication authentication) {

        if (authentication == null
                || !authentication.isAuthenticated()) {

            throw new IllegalStateException(
                    "Authentication is required."
            );
        }

        String email =
                authentication
                        .getName()
                        .trim()
                        .toLowerCase();

        User currentUser =
                userRepository
                        .findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Logged-in user not found."
                                )
                        );

        if (currentUser.getRole()
                != User.Role.CUSTOMER) {

            throw new IllegalStateException(
                    "Only customers can access their own sites."
            );
        }

        Customer customer =
                customerRepository
                        .findByContactEmailIgnoreCase(
                                email
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Customer profile not found for logged-in user."
                                )
                        );

        return siteService.getByCustomer(
                customer.getId()
        );
    }
    // =========================================================
// CUSTOMER - CREATE MY SITE
// =========================================================

@PostMapping("/customer/sites")
public SiteResponse createMySite(
        @Valid
        @RequestBody
        SiteRequest request,
        Authentication authentication) {

    if (authentication == null
            || !authentication.isAuthenticated()) {

        throw new IllegalStateException(
                "Authentication is required."
        );
    }

    String email =
            authentication
                    .getName()
                    .trim()
                    .toLowerCase();

    User currentUser =
            userRepository
                    .findByEmail(email)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Logged-in user not found."
                            )
                    );

    if (currentUser.getRole()
            != User.Role.CUSTOMER) {

        throw new IllegalStateException(
                "Only customers can create their own sites."
        );
    }

    Customer customer =
            customerRepository
                    .findByContactEmailIgnoreCase(
                            email
                    )
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Customer profile not found for logged-in user."
                            )
                    );

    request.setCustomerId(
            customer.getId()
    );

    return siteService.create(
            request
    );
}
}