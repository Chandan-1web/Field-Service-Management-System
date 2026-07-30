package com.fieldservicemanagement.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fieldservicemanagement.dto.OverdueWorkOrderResponse;
import com.fieldservicemanagement.service.OverdueWorkOrderService;

@RestController
@RequestMapping("/api/reports/work-orders")
public class OverdueWorkOrderController {

    private final OverdueWorkOrderService overdueWorkOrderService;

    public OverdueWorkOrderController(
            OverdueWorkOrderService overdueWorkOrderService) {

        this.overdueWorkOrderService =
                overdueWorkOrderService;
    }

    @GetMapping("/overdue")
    @PreAuthorize("hasAnyRole('MANAGER', 'DISPATCHER')")
    public ResponseEntity<List<OverdueWorkOrderResponse>>
            getOverdueWorkOrders() {

        List<OverdueWorkOrderResponse> response =
                overdueWorkOrderService
                        .getOverdueWorkOrders();

        return ResponseEntity.ok(response);
    }
}