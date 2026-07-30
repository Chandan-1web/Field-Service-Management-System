package com.fieldservicemanagement.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fieldservicemanagement.entity.WorkOrderStatusHistory;

public interface WorkOrderStatusHistoryRepository extends JpaRepository<WorkOrderStatusHistory, Long> {
    List<WorkOrderStatusHistory> findByWorkOrderIdOrderByChangedAtAsc(Long workOrderId);
}