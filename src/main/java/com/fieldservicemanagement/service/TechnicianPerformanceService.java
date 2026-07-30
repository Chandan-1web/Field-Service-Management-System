package com.fieldservicemanagement.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fieldservicemanagement.dto.TechnicianPerformanceResponse;
import com.fieldservicemanagement.entity.User;
import com.fieldservicemanagement.entity.WorkOrder;
import com.fieldservicemanagement.repository.TimeLogRepository;
import com.fieldservicemanagement.repository.UserRepository;
import com.fieldservicemanagement.repository.WorkOrderRepository;

@Service
public class TechnicianPerformanceService {

    private final UserRepository userRepository;
    private final WorkOrderRepository workOrderRepository;
    private final TimeLogRepository timeLogRepository;

    public TechnicianPerformanceService(
            UserRepository userRepository,
            WorkOrderRepository workOrderRepository,
            TimeLogRepository timeLogRepository) {

        this.userRepository = userRepository;
        this.workOrderRepository = workOrderRepository;
        this.timeLogRepository = timeLogRepository;
    }

    @Transactional(readOnly = true)
    public TechnicianPerformanceResponse getPerformance(
            Long technicianId) {

        User technician = userRepository
                .findById(technicianId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found with id: "
                                        + technicianId));

        if (technician.getRole() != User.Role.TECHNICIAN) {
            throw new IllegalStateException(
                    "Selected user is not a technician.");
        }

        long totalAssignedWorkOrders =
                workOrderRepository
                        .countByAssignedToId(technicianId);

        long inProgressWorkOrders =
                workOrderRepository
                        .countByAssignedToIdAndStatus(
                                technicianId,
                                WorkOrder.Status.IN_PROGRESS);

        long completedWorkOrders =
                workOrderRepository
                        .countByAssignedToIdAndStatus(
                                technicianId,
                                WorkOrder.Status.COMPLETED);

        long closedWorkOrders =
                workOrderRepository
                        .countByAssignedToIdAndStatus(
                                technicianId,
                                WorkOrder.Status.CLOSED);

        Long minutesResult =
                timeLogRepository
                        .getTotalMinutesByTechnicianId(
                                technicianId);

        long totalMinutesLogged =
                minutesResult == null ? 0 : minutesResult;

        double totalHoursLogged =
                totalMinutesLogged / 60.0;

        /*
         * Both COMPLETED and CLOSED work orders are considered
         * successfully completed by the technician.
         */
        long finishedWorkOrders =
                completedWorkOrders + closedWorkOrders;

        double completionPercentage = 0.0;

        if (totalAssignedWorkOrders > 0) {
            completionPercentage =
                    ((double) finishedWorkOrders
                            / totalAssignedWorkOrders) * 100;
        }

        /*
         * Limit the decimal values to two digits.
         */
        totalHoursLogged =
                Math.round(totalHoursLogged * 100.0) / 100.0;

        completionPercentage =
                Math.round(completionPercentage * 100.0) / 100.0;

        return new TechnicianPerformanceResponse(
                technician.getId(),
                technician.getName(),
                technician.getEmail(),
                totalAssignedWorkOrders,
                inProgressWorkOrders,
                completedWorkOrders,
                closedWorkOrders,
                totalMinutesLogged,
                totalHoursLogged,
                completionPercentage
        );
    }
}