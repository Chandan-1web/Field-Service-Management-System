package com.fieldservicemanagement.dto;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TimeLogResponse {

    private Long id;

    private Long workOrderId;

    private String workOrderCode;

    private Long technicianId;

    private String technicianName;

    private Integer minutes;

    private String note;

    private LocalDateTime loggedAt;
}