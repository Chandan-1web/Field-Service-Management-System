package com.fieldservicemanagement.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AssignmentRequest {

    @NotNull(message = "Technician ID is required")
    private Long technicianId;

    private String note;
}