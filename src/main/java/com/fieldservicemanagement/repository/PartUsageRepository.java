package com.fieldservicemanagement.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fieldservicemanagement.entity.PartUsage;

public interface PartUsageRepository extends JpaRepository<PartUsage, Long> {
    List<PartUsage> findByWorkOrderId(Long workOrderId);
}