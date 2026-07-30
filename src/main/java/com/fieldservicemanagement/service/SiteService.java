package com.fieldservicemanagement.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.fieldservicemanagement.dto.SiteRequest;
import com.fieldservicemanagement.dto.SiteResponse;
import com.fieldservicemanagement.entity.Customer;
import com.fieldservicemanagement.entity.Site;
import com.fieldservicemanagement.repository.CustomerRepository;
import com.fieldservicemanagement.repository.SiteRepository;

@Service
public class SiteService {

    private final SiteRepository siteRepository;
    private final CustomerRepository customerRepository;

    public SiteService(SiteRepository siteRepository, CustomerRepository customerRepository) {
        this.siteRepository = siteRepository;
        this.customerRepository = customerRepository;
    }

    public SiteResponse create(SiteRequest request) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Customer not found with id: " + request.getCustomerId()));

        Site site = new Site();
        site.setCustomer(customer);
        site.setName(request.getName());
        site.setAddress(request.getAddress());
        Site saved = siteRepository.save(site);
        return toResponse(saved);
    }

    public List<SiteResponse> getByCustomer(Long customerId) {
        return siteRepository.findByCustomerId(customerId).stream()
                .map(this::toResponse)
                .toList();
    }

    public List<SiteResponse> getAll() {
        return siteRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    private SiteResponse toResponse(Site site) {
        return new SiteResponse(
                site.getId(),
                site.getCustomer().getId(),
                site.getCustomer().getName(),
                site.getName(),
                site.getAddress()
        );
    }
}