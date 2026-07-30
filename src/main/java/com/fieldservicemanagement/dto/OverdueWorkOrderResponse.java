package com.fieldservicemanagement.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class OverdueWorkOrderResponse {

    private Long workOrderId;
    private String code;
    private String title;
    private String priority;
    private String status;

    private String customerName;
    private String siteName;
    private String assignedTechnicianName;

    private LocalDateTime slaDueAt;

    private long overdueMinutes;
    private long overdueHours;
    private long overdueDays;
}