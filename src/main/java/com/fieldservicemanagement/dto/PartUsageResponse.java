package com.fieldservicemanagement.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class PartUsageResponse {

    private Long id;

    private Long workOrderId;

    private String workOrderCode;

    private Long partId;

    private String partName;

    private String sku;

    private Integer qtyUsed;

    private Integer remainingStock;

    private BigDecimal unitCost;

    private LocalDateTime usedAt;
}