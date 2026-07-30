package com.fieldservicemanagement.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fieldservicemanagement.dto.CustomerRequest;
import com.fieldservicemanagement.dto.CustomerResponse;
import com.fieldservicemanagement.service.CustomerService;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('DISPATCHER', 'MANAGER')")
    public CustomerResponse create(@RequestBody CustomerRequest request) {
        return customerService.create(request);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('DISPATCHER', 'MANAGER')")
    public List<CustomerResponse> getAll() {
        return customerService.getAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('DISPATCHER', 'MANAGER')")
    public CustomerResponse getById(@PathVariable Long id) {
        return customerService.getById(id);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('DISPATCHER', 'MANAGER')")
    public CustomerResponse update(@PathVariable Long id, @RequestBody CustomerRequest request) {
        return customerService.update(id, request);
    }
}