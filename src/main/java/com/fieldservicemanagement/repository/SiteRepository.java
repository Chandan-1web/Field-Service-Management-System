package com.fieldservicemanagement.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fieldservicemanagement.entity.Site;

public interface SiteRepository extends JpaRepository<Site, Long> {
    List<Site> findByCustomerId(Long customerId);
}