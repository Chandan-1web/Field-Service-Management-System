package com.fieldservicemanagement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class WorkOrderRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotBlank(message = "Priority is required")
    private String priority;

    @NotNull(message = "Customer ID is required")
    private Long customerId;

    @NotNull(message = "Site ID is required")
    private Long siteId;
}