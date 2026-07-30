package com.fieldservicemanagement.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fieldservicemanagement.entity.Customer;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
}