package com.fieldservicemanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class DashboardSummaryResponse 
{
    private long totalWorkOrders;
private long newWorkOrders;
private long assignedWorkOrders;
private long inProgressWorkOrders;
private long onHoldWorkOrders;
private long completedWorkOrders;
private long closedWorkOrders;
private long cancelledWorkOrders;
private long totalCustomers;
private long totalSites;
private long totalParts;
}