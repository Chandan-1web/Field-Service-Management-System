package com.fieldservicemanagement.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StatusTransitionRequest {

    @NotBlank(message = "New status is required")
    private String newStatus;

    private String note;
}