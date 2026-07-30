package com.fieldservicemanagement.service;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fieldservicemanagement.dto.PartUsageRequest;
import com.fieldservicemanagement.dto.PartUsageResponse;
import com.fieldservicemanagement.entity.Part;
import com.fieldservicemanagement.entity.PartUsage;
import com.fieldservicemanagement.entity.User;
import com.fieldservicemanagement.entity.WorkOrder;
import com.fieldservicemanagement.repository.PartRepository;
import com.fieldservicemanagement.repository.PartUsageRepository;
import com.fieldservicemanagement.repository.WorkOrderRepository;

@Service
public class PartUsageService {

    private final PartUsageRepository partUsageRepository;
    private final PartRepository partRepository;
    private final WorkOrderRepository workOrderRepository;

    public PartUsageService(
            PartUsageRepository partUsageRepository,
            PartRepository partRepository,
            WorkOrderRepository workOrderRepository) {

        this.partUsageRepository = partUsageRepository;
        this.partRepository = partRepository;
        this.workOrderRepository = workOrderRepository;
    }

    @Transactional
    public PartUsageResponse usePart(
            Long workOrderId,
            PartUsageRequest request,
            User currentUser) {

        WorkOrder workOrder = workOrderRepository
                .findById(workOrderId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Work order not found with id: "
                                        + workOrderId
                        )
                );

        validatePartUsageAccess(
                workOrder,
                currentUser
        );

        Part part = partRepository
                .findById(request.getPartId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Part not found with id: "
                                        + request.getPartId()
                        )
                );

        if (request.getQtyUsed() == null
                || request.getQtyUsed() <= 0) {

            throw new IllegalArgumentException(
                    "Quantity used must be greater than zero"
            );
        }

        if (part.getStockQty() < request.getQtyUsed()) {
            throw new IllegalStateException(
                    "Insufficient stock. Available quantity: "
                            + part.getStockQty()
            );
        }

        part.setStockQty(
                part.getStockQty() - request.getQtyUsed()
        );

        partRepository.save(part);

        PartUsage partUsage = new PartUsage();
        partUsage.setWorkOrder(workOrder);
        partUsage.setPart(part);
        partUsage.setQtyUsed(request.getQtyUsed());
        partUsage.setUsedAt(LocalDateTime.now());

        PartUsage savedPartUsage =
                partUsageRepository.save(partUsage);

        return mapToResponse(savedPartUsage);
    }

    private PartUsageResponse mapToResponse(
            PartUsage partUsage) {

        return new PartUsageResponse(
                partUsage.getId(),
                partUsage.getWorkOrder().getId(),
                partUsage.getWorkOrder().getCode(),
                partUsage.getPart().getId(),
                partUsage.getPart().getName(),
                partUsage.getPart().getSku(),
                partUsage.getQtyUsed(),
                partUsage.getPart().getStockQty(),
                partUsage.getPart().getUnitCost(),
                partUsage.getUsedAt()
        );
    }

    private void validatePartUsageAccess(
            WorkOrder workOrder,
            User currentUser) {

        if (currentUser.getRole() == User.Role.MANAGER) {
            return;
        }

        if (currentUser.getRole() != User.Role.TECHNICIAN) {
            throw new IllegalStateException(
                    "Only technicians and managers can record part usage."
            );
        }

        if (workOrder.getAssignedTo() == null) {
            throw new IllegalStateException(
                    "This work order is not assigned to any technician."
            );
        }

        boolean isAssignedTechnician =
                workOrder.getAssignedTo()
                        .getId()
                        .equals(currentUser.getId());

        if (!isAssignedTechnician) {
            throw new IllegalStateException(
                    "You can record part usage only for "
                            + "work orders assigned to you."
            );
        }

        if (workOrder.getStatus() == WorkOrder.Status.CLOSED
                || workOrder.getStatus()
                == WorkOrder.Status.CANCELLED) {

            throw new IllegalStateException(
                    "Parts cannot be recorded for closed "
                            + "or cancelled work orders."
            );
        }
    }
}