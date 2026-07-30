package com.fieldservicemanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class TechnicianPerformanceResponse {

    private Long technicianId;
    private String technicianName;
    private String technicianEmail;

    private long totalAssignedWorkOrders;
    private long inProgressWorkOrders;
    private long completedWorkOrders;
    private long closedWorkOrders;

    private long totalMinutesLogged;
    private double totalHoursLogged;

    private double completionPercentage;
}