package com.fieldservicemanagement.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fieldservicemanagement.dto.TimeLogRequest;
import com.fieldservicemanagement.dto.TimeLogResponse;
import com.fieldservicemanagement.entity.TimeLog;
import com.fieldservicemanagement.entity.User;
import com.fieldservicemanagement.entity.WorkOrder;
import com.fieldservicemanagement.repository.TimeLogRepository;
import com.fieldservicemanagement.repository.WorkOrderRepository;

@Service
public class TimeLogService {

    private final TimeLogRepository timeLogRepository;
    private final WorkOrderRepository workOrderRepository;

    public TimeLogService(
            TimeLogRepository timeLogRepository,
            WorkOrderRepository workOrderRepository) {

        this.timeLogRepository =
                timeLogRepository;

        this.workOrderRepository =
                workOrderRepository;
    }

    // =========================================================
    // TECHNICIAN - LOG TIME
    // =========================================================

    @Transactional
    public TimeLogResponse logTime(
            Long workOrderId,
            TimeLogRequest request,
            User currentUser) {

        WorkOrder workOrder =
                getWorkOrder(workOrderId);

        validateTechnicianAssignment(
                workOrder,
                currentUser
        );

        validateWorkOrderStatus(
                workOrder
        );

        TimeLog timeLog =
                new TimeLog();

        timeLog.setWorkOrder(
                workOrder
        );

        timeLog.setTechnician(
                currentUser
        );

        timeLog.setMinutes(
                request.getMinutes()
        );

        timeLog.setNote(
                cleanOptional(
                        request.getNote()
                )
        );

        timeLog.setLoggedAt(
                LocalDateTime.now()
        );

        TimeLog savedTimeLog =
                timeLogRepository.save(
                        timeLog
                );

        return mapToResponse(
                savedTimeLog
        );
    }

    // =========================================================
    // GET TIME LOGS FOR ONE WORK ORDER
    // =========================================================

    @Transactional(readOnly = true)
    public List<TimeLogResponse> getByWorkOrder(
            Long workOrderId,
            User currentUser) {

        WorkOrder workOrder =
                getWorkOrder(workOrderId);

        validateViewAccess(
                workOrder,
                currentUser
        );

        return timeLogRepository
                .findByWorkOrderId(
                        workOrderId
                )
                .stream()
                .map(
                        this::mapToResponse
                )
                .toList();
    }

    // =========================================================
    // TECHNICIAN - GET ALL MY TIME LOGS
    // =========================================================

    @Transactional(readOnly = true)
    public List<TimeLogResponse> getMyTimeLogs(
            User currentUser) {

        if (currentUser.getRole()
                != User.Role.TECHNICIAN) {

            throw new IllegalStateException(
                    "Only technicians can view their personal time logs."
            );
        }

        return timeLogRepository
                .findByTechnicianIdOrderByLoggedAtDesc(
                        currentUser.getId()
                )
                .stream()
                .map(
                        this::mapToResponse
                )
                .toList();
    }

    // =========================================================
    // TECHNICIAN - TOTAL LOGGED MINUTES
    // =========================================================

    @Transactional(readOnly = true)
    public long getMyTotalMinutes(
            User currentUser) {

        if (currentUser.getRole()
                != User.Role.TECHNICIAN) {

            throw new IllegalStateException(
                    "Only technicians can view their total logged time."
            );
        }

        Long totalMinutes =
                timeLogRepository
                        .getTotalMinutesByTechnicianId(
                                currentUser.getId()
                        );

        return totalMinutes == null
                ? 0L
                : totalMinutes;
    }

    // =========================================================
    // WORK ORDER HELPER
    // =========================================================

    private WorkOrder getWorkOrder(
            Long workOrderId) {

        return workOrderRepository
                .findById(
                        workOrderId
                )
                .orElseThrow(() ->
                        new RuntimeException(
                                "Work order not found with id: "
                                        + workOrderId
                        )
                );
    }

    // =========================================================
    // LOG-TIME ACCESS VALIDATION
    // =========================================================

    private void validateTechnicianAssignment(
            WorkOrder workOrder,
            User currentUser) {

        if (currentUser.getRole()
                != User.Role.TECHNICIAN) {

            throw new IllegalStateException(
                    "Only technicians can log time."
            );
        }

        if (workOrder.getAssignedTo()
                == null) {

            throw new IllegalStateException(
                    "No technician is assigned to this work order."
            );
        }

        boolean isAssignedTechnician =
                workOrder.getAssignedTo()
                        .getId()
                        .equals(
                                currentUser.getId()
                        );

        if (!isAssignedTechnician) {

            throw new IllegalStateException(
                    "You are not assigned to this work order."
            );
        }
    }

    // =========================================================
    // VIEW ACCESS VALIDATION
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
                    "You are not authorized to view time logs."
            );
        }

        if (workOrder.getAssignedTo()
                == null) {

            throw new IllegalStateException(
                    "This work order is not assigned to a technician."
            );
        }

        boolean isAssignedTechnician =
                workOrder.getAssignedTo()
                        .getId()
                        .equals(
                                currentUser.getId()
                        );

        if (!isAssignedTechnician) {

            throw new IllegalStateException(
                    "You can view time logs only for work orders assigned to you."
            );
        }
    }

    // =========================================================
    // WORK ORDER STATUS VALIDATION
    // =========================================================

    private void validateWorkOrderStatus(
            WorkOrder workOrder) {

        if (workOrder.getStatus()
                == WorkOrder.Status.CLOSED
                || workOrder.getStatus()
                == WorkOrder.Status.CANCELLED) {

            throw new IllegalStateException(
                    "Time cannot be logged for closed or cancelled work orders."
            );
        }
    }

    // =========================================================
    // RESPONSE MAPPER
    // =========================================================

    private TimeLogResponse mapToResponse(
            TimeLog timeLog) {

        TimeLogResponse response =
                new TimeLogResponse();

        response.setId(
                timeLog.getId()
        );

        response.setWorkOrderId(
                timeLog.getWorkOrder()
                        .getId()
        );

        response.setWorkOrderCode(
                timeLog.getWorkOrder()
                        .getCode()
        );

        response.setTechnicianId(
                timeLog.getTechnician()
                        .getId()
        );

        response.setTechnicianName(
                timeLog.getTechnician()
                        .getName()
        );

        response.setMinutes(
                timeLog.getMinutes()
        );

        response.setNote(
                timeLog.getNote()
        );

        response.setLoggedAt(
                timeLog.getLoggedAt()
        );

        return response;
    }

    // =========================================================
    // GENERAL HELPER
    // =========================================================

    private String cleanOptional(
            String value) {

        if (value == null
                || value.isBlank()) {

            return null;
        }

        return value.trim();
    }
}