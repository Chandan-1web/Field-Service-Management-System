package com.fieldservicemanagement.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class WorkOrderResponse {

    private Long id;
    private String code;
    private String title;
    private String description;
    private String priority;
    private String status;

    private Long customerId;
    private String customerName;

    private Long siteId;
    private String siteName;

    private String assignedToName;

    private LocalDateTime slaDueAt;
    private LocalDateTime createdAt;

    private LocalDateTime completedAt;
    private String completionNote;

    private LocalDateTime closedAt;
    private String closureNote;
}