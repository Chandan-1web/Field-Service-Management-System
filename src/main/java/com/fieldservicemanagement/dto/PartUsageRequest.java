package com.fieldservicemanagement.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PartUsageRequest {

    @NotNull
    private Long partId;

    @NotNull
    @Min(1)
    private Integer qtyUsed;
}