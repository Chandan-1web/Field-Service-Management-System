package com.fieldservicemanagement.service;

import java.time.LocalDateTime;
import java.util.List;

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

    // =========================================================
    // RECORD PART USAGE
    // =========================================================

    @Transactional
    public PartUsageResponse usePart(
            Long workOrderId,
            PartUsageRequest request,
            User currentUser) {

        WorkOrder workOrder =
                getWorkOrder(workOrderId);

        validatePartUsageAccess(
                workOrder,
                currentUser
        );

        Part part =
                partRepository
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
                    "Quantity used must be greater than zero."
            );
        }

        if (part.getStockQty() < request.getQtyUsed()) {

            throw new IllegalStateException(
                    "Insufficient stock. Available quantity: "
                            + part.getStockQty()
            );
        }

        // Reduce inventory stock
        part.setStockQty(
                part.getStockQty()
                        - request.getQtyUsed()
        );

        partRepository.save(part);

        // Save usage history
        PartUsage partUsage =
                new PartUsage();

        partUsage.setWorkOrder(workOrder);
        partUsage.setPart(part);
        partUsage.setQtyUsed(request.getQtyUsed());
        partUsage.setUsedAt(LocalDateTime.now());

        PartUsage savedPartUsage =
                partUsageRepository.save(partUsage);

        return mapToResponse(savedPartUsage);
    }

    // =========================================================
    // GET PARTS USED FOR ONE WORK ORDER
    // =========================================================

    @Transactional(readOnly = true)
    public List<PartUsageResponse> getByWorkOrder(
            Long workOrderId,
            User currentUser) {

        WorkOrder workOrder =
                getWorkOrder(workOrderId);

        validateViewAccess(
                workOrder,
                currentUser
        );

        return partUsageRepository
                .findByWorkOrderIdOrderByUsedAtDesc(
                        workOrderId
                )
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // =========================================================
    // TECHNICIAN - GET MY PART USAGE
    // =========================================================

    @Transactional(readOnly = true)
    public List<PartUsageResponse> getMyPartUsage(
            User currentUser) {

        if (currentUser.getRole()
                != User.Role.TECHNICIAN) {

            throw new IllegalStateException(
                    "Only technicians can view their personal part usage."
            );
        }

        return partUsageRepository
                .findByTechnicianId(
                        currentUser.getId()
                )
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // =========================================================
    // WORK ORDER
    // =========================================================

    private WorkOrder getWorkOrder(
            Long workOrderId) {

        return workOrderRepository
                .findById(workOrderId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Work order not found with id: "
                                        + workOrderId
                        )
                );
    }

    // =========================================================
    // RECORD ACCESS
    // =========================================================

    private void validatePartUsageAccess(
            WorkOrder workOrder,
            User currentUser) {

        if (currentUser.getRole()
                == User.Role.MANAGER) {

            return;
        }

        if (currentUser.getRole()
                != User.Role.TECHNICIAN) {

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
                    "You can record part usage only for work orders assigned to you."
            );
        }

        if (workOrder.getStatus()
                == WorkOrder.Status.CLOSED
                || workOrder.getStatus()
                == WorkOrder.Status.CANCELLED) {

            throw new IllegalStateException(
                    "Parts cannot be recorded for closed or cancelled work orders."
            );
        }
    }

    // =========================================================
    // VIEW ACCESS
    // =========================================================

    private void validateViewAccess(
            WorkOrder workOrder,
            User currentUser) {

        if (currentUser.getRole()
                == User.Role.MANAGER
                || currentUser.getRole()
                == User.Role.DISPATCHER) {

            return;
        }

        if (currentUser.getRole()
                != User.Role.TECHNICIAN) {

            throw new IllegalStateException(
                    "You are not authorized to view part usage."
            );
        }

        if (workOrder.getAssignedTo() == null) {

            throw new IllegalStateException(
                    "This work order is not assigned to a technician."
            );
        }

        boolean assigned =
                workOrder.getAssignedTo()
                        .getId()
                        .equals(currentUser.getId());

        if (!assigned) {

            throw new IllegalStateException(
                    "You can view part usage only for work orders assigned to you."
            );
        }
    }

    // =========================================================
    // RESPONSE MAPPER
    // =========================================================

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
}