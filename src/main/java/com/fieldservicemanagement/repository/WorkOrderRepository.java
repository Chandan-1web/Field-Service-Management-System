package com.fieldservicemanagement.repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.fieldservicemanagement.entity.WorkOrder;

public interface WorkOrderRepository
        extends JpaRepository<WorkOrder, Long>,
        JpaSpecificationExecutor<WorkOrder> {

    List<WorkOrder> findByStatus(
            WorkOrder.Status status);

    Page<WorkOrder> findByTitleContainingIgnoreCase(
            String keyword,
            Pageable pageable);

    List<WorkOrder> findByAssignedToId(
            Long technicianId);

    long countByStatus(
            WorkOrder.Status status);

    long countByAssignedToId(
            Long technicianId);

    long countByAssignedToIdAndStatus(
            Long technicianId,
            WorkOrder.Status status);

    boolean existsByCustomerIdAndSiteIdAndTitleIgnoreCaseAndStatusIn(
            Long customerId,
            Long siteId,
            String title,
            Collection<WorkOrder.Status> statuses);

    List<WorkOrder> findBySlaDueAtBeforeAndStatusNotIn(
            LocalDateTime currentTime,
            Collection<WorkOrder.Status> excludedStatuses);

    List<WorkOrder> findByCustomerIdOrderByCreatedAtDesc(
        Long customerId
);
}