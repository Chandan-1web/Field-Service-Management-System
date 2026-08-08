package com.fieldservicemanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class TechnicianWorkloadResponse {

    private Long id;
    private String name;
    private String email;
    private long activeJobs;
    private String availabilityStatus;
}