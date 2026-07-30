package com.fieldservicemanagement.service;

import java.time.LocalDateTime;
import java.util.EnumMap;
import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fieldservicemanagement.entity.User;
import com.fieldservicemanagement.entity.WorkOrder;
import com.fieldservicemanagement.entity.WorkOrderStatusHistory;
import com.fieldservicemanagement.repository.WorkOrderRepository;
import com.fieldservicemanagement.repository.WorkOrderStatusHistoryRepository;

@Service
public class WorkOrderLifecycleService {

    private final WorkOrderRepository workOrderRepository;
    private final WorkOrderStatusHistoryRepository historyRepository;
    private final EmailService emailService;

    @Value("${app.notification.manager-email}")
    private String managerEmail;

    private static final Map<WorkOrder.Status, Set<WorkOrder.Status>>
            ALLOWED_TRANSITIONS =
            new EnumMap<>(WorkOrder.Status.class);

    static {
        ALLOWED_TRANSITIONS.put(
                WorkOrder.Status.NEW,
                EnumSet.of(
                        WorkOrder.Status.ASSIGNED,
                        WorkOrder.Status.CANCELLED
                )
        );

        ALLOWED_TRANSITIONS.put(
                WorkOrder.Status.ASSIGNED,
                EnumSet.of(
                        WorkOrder.Status.IN_PROGRESS,
                        WorkOrder.Status.CANCELLED
                )
        );

        ALLOWED_TRANSITIONS.put(
                WorkOrder.Status.IN_PROGRESS,
                EnumSet.of(
                        WorkOrder.Status.ON_HOLD,
                        WorkOrder.Status.COMPLETED
                )
        );

        ALLOWED_TRANSITIONS.put(
                WorkOrder.Status.ON_HOLD,
                EnumSet.of(
                        WorkOrder.Status.IN_PROGRESS
                )
        );

        ALLOWED_TRANSITIONS.put(
                WorkOrder.Status.COMPLETED,
                EnumSet.of(
                        WorkOrder.Status.CLOSED
                )
        );

        ALLOWED_TRANSITIONS.put(
                WorkOrder.Status.CLOSED,
                EnumSet.noneOf(WorkOrder.Status.class)
        );

        ALLOWED_TRANSITIONS.put(
                WorkOrder.Status.CANCELLED,
                EnumSet.noneOf(WorkOrder.Status.class)
        );
    }

    public WorkOrderLifecycleService(
            WorkOrderRepository workOrderRepository,
            WorkOrderStatusHistoryRepository historyRepository,
            EmailService emailService) {

        this.workOrderRepository = workOrderRepository;
        this.historyRepository = historyRepository;
        this.emailService = emailService;
    }

    @Transactional
    public WorkOrder transition(
            Long workOrderId,
            WorkOrder.Status newStatus,
            User changedBy,
            String note) {

        WorkOrder workOrder =
                workOrderRepository.findById(workOrderId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Work order not found with id: "
                                                + workOrderId
                                )
                        );

        WorkOrder.Status currentStatus =
                workOrder.getStatus();

        Set<WorkOrder.Status> allowedNext =
                ALLOWED_TRANSITIONS.get(currentStatus);

        if (allowedNext == null
                || !allowedNext.contains(newStatus)) {

            throw new IllegalStateException(
                    "Illegal transition: cannot move from "
                            + currentStatus
                            + " to "
                            + newStatus
            );
        }

        if (newStatus == WorkOrder.Status.COMPLETED) {

            if (note == null || note.isBlank()) {
                throw new IllegalArgumentException(
                        "Completion note is required when completing "
                                + "a work order."
                );
            }

            workOrder.setCompletedAt(LocalDateTime.now());
            workOrder.setCompletionNote(note);
        }

        if (newStatus == WorkOrder.Status.CLOSED) {

            if (note == null || note.isBlank()) {
                throw new IllegalArgumentException(
                        "Closure note is required when closing "
                                + "a work order."
                );
            }

            workOrder.setClosedAt(LocalDateTime.now());
            workOrder.setClosureNote(note);
        }

        workOrder.setStatus(newStatus);
        workOrder.setUpdatedAt(LocalDateTime.now());

        WorkOrder savedWorkOrder =
                workOrderRepository.save(workOrder);

        WorkOrderStatusHistory history =
                new WorkOrderStatusHistory();

        history.setWorkOrder(savedWorkOrder);
        history.setFromStatus(currentStatus.name());
        history.setToStatus(newStatus.name());
        history.setChangedBy(changedBy);
        history.setChangedAt(LocalDateTime.now());
        history.setNote(note);

        historyRepository.save(history);

        if (newStatus == WorkOrder.Status.COMPLETED) {
            sendCompletionNotification(
                    savedWorkOrder,
                    changedBy
            );
        }

        return savedWorkOrder;
    }

    private void sendCompletionNotification(
            WorkOrder workOrder,
            User completedBy) {

        try {
            String subject =
                    "Work Order Completed - "
                            + workOrder.getCode();

            String body =
                    "Hello Manager,\n\n"
                            + "A work order has been completed.\n\n"
                            + "Work Order Code: "
                            + workOrder.getCode()
                            + "\n"
                            + "Title: "
                            + workOrder.getTitle()
                            + "\n"
                            + "Completed By: "
                            + completedBy.getName()
                            + "\n"
                            + "Customer: "
                            + workOrder.getCustomer().getName()
                            + "\n"
                            + "Site: "
                            + workOrder.getSite().getName()
                            + "\n"
                            + "Completion Note: "
                            + workOrder.getCompletionNote()
                            + "\n"
                            + "Completed At: "
                            + workOrder.getCompletedAt()
                            + "\n\n"
                            + "Field Service Management System";

            emailService.sendSimpleEmail(
                    managerEmail,
                    subject,
                    body
            );

        } catch (Exception exception) {
            System.err.println(
                    "Work order was completed, but completion email failed: "
                            + exception.getMessage()
            );
        }
    }
}