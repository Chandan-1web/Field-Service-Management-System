package com.fieldservicemanagement.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fieldservicemanagement.dto.SiteRequest;
import com.fieldservicemanagement.dto.SiteResponse;
import com.fieldservicemanagement.service.SiteService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
public class SiteController {

    private final SiteService siteService;

    public SiteController(
            SiteService siteService) {

        this.siteService = siteService;
    }

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

    @GetMapping("/customers/{customerId}/sites")
    @PreAuthorize(
            "hasAnyRole('DISPATCHER', 'MANAGER')"
    )
    public List<SiteResponse> getByCustomer(
            @PathVariable Long customerId) {

        return siteService
                .getByCustomer(customerId);
    }

    @GetMapping("/sites")
    @PreAuthorize(
            "hasAnyRole('DISPATCHER', 'MANAGER')"
    )
    public List<SiteResponse> getAll() {

        return siteService.getAll();
    }
}