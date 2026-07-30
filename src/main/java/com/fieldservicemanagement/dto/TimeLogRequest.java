package com.fieldservicemanagement.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TimeLogRequest {

    @NotNull(message = "Minutes are required")
    @Min(value = 1, message = "Minutes must be at least 1")
    private Integer minutes;

    private String note;
}