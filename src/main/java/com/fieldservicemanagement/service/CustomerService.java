package com.fieldservicemanagement.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.fieldservicemanagement.dto.CustomerRequest;
import com.fieldservicemanagement.dto.CustomerResponse;
import com.fieldservicemanagement.entity.Customer;
import com.fieldservicemanagement.repository.CustomerRepository;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;

    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    public CustomerResponse create(CustomerRequest request) {
        Customer customer = new Customer();
        customer.setName(request.getName());
        customer.setContactEmail(request.getContactEmail());
        Customer saved = customerRepository.save(customer);
        return toResponse(saved);
    }

    public List<CustomerResponse> getAll() {
        return customerRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public CustomerResponse getById(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found with id: " + id));
        return toResponse(customer);
    }

    public CustomerResponse update(Long id, CustomerRequest request) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found with id: " + id));
        customer.setName(request.getName());
        customer.setContactEmail(request.getContactEmail());
        Customer saved = customerRepository.save(customer);
        return toResponse(saved);
    }

    private CustomerResponse toResponse(Customer customer) {
        return new CustomerResponse(customer.getId(), customer.getName(), customer.getContactEmail());
    }
}