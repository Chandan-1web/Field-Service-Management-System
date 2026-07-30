package com.fieldservicemanagement.service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fieldservicemanagement.dto.OverdueWorkOrderResponse;
import com.fieldservicemanagement.entity.WorkOrder;
import com.fieldservicemanagement.repository.WorkOrderRepository;

@Service
public class OverdueWorkOrderService {

    private final WorkOrderRepository workOrderRepository;

    public OverdueWorkOrderService(
            WorkOrderRepository workOrderRepository) {

        this.workOrderRepository = workOrderRepository;
    }

    @Transactional(readOnly = true)
    public List<OverdueWorkOrderResponse> getOverdueWorkOrders() {

        LocalDateTime currentTime = LocalDateTime.now();

        Set<WorkOrder.Status> excludedStatuses =
                EnumSet.of(
                        WorkOrder.Status.COMPLETED,
                        WorkOrder.Status.CLOSED,
                        WorkOrder.Status.CANCELLED
                );

        return workOrderRepository
                .findBySlaDueAtBeforeAndStatusNotIn(
                        currentTime,
                        excludedStatuses)
                .stream()
                .map(workOrder ->
                        toResponse(workOrder, currentTime))
                .toList();
    }

    private OverdueWorkOrderResponse toResponse(
            WorkOrder workOrder,
            LocalDateTime currentTime) {

        Duration overdueDuration =
                Duration.between(
                        workOrder.getSlaDueAt(),
                        currentTime);

        long overdueMinutes =
                overdueDuration.toMinutes();

        long overdueHours =
                overdueDuration.toHours();

        long overdueDays =
                overdueDuration.toDays();

        return new OverdueWorkOrderResponse(
                workOrder.getId(),
                workOrder.getCode(),
                workOrder.getTitle(),
                workOrder.getPriority().name(),
                workOrder.getStatus().name(),

                workOrder.getCustomer().getName(),
                workOrder.getSite().getName(),

                workOrder.getAssignedTo() != null
                        ? workOrder.getAssignedTo().getName()
                        : null,

                workOrder.getSlaDueAt(),
                overdueMinutes,
                overdueHours,
                overdueDays
        );
    }
}