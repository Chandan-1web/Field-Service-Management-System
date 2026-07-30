package com.fieldservicemanagement.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fieldservicemanagement.dto.DashboardSummaryResponse;
import com.fieldservicemanagement.entity.WorkOrder;
import com.fieldservicemanagement.repository.CustomerRepository;
import com.fieldservicemanagement.repository.PartRepository;
import com.fieldservicemanagement.repository.SiteRepository;
import com.fieldservicemanagement.repository.WorkOrderRepository;

@Service
public class DashboardService {

    private final WorkOrderRepository workOrderRepository;
    private final CustomerRepository customerRepository;
    private final SiteRepository siteRepository;
    private final PartRepository partRepository;

    public DashboardService(
            WorkOrderRepository workOrderRepository,
            CustomerRepository customerRepository,
            SiteRepository siteRepository,
            PartRepository partRepository) {

        this.workOrderRepository = workOrderRepository;
        this.customerRepository = customerRepository;
        this.siteRepository = siteRepository;
        this.partRepository = partRepository;
    }

    @Transactional(readOnly = true)
    public DashboardSummaryResponse getSummary() {

        long totalWorkOrders =
                workOrderRepository.count();

        long newWorkOrders =
                workOrderRepository.countByStatus(
                        WorkOrder.Status.NEW);

        long assignedWorkOrders =
                workOrderRepository.countByStatus(
                        WorkOrder.Status.ASSIGNED);

        long inProgressWorkOrders =
                workOrderRepository.countByStatus(
                        WorkOrder.Status.IN_PROGRESS);

        long onHoldWorkOrders =
                workOrderRepository.countByStatus(
                        WorkOrder.Status.ON_HOLD);

        long completedWorkOrders =
                workOrderRepository.countByStatus(
                        WorkOrder.Status.COMPLETED);

        long closedWorkOrders =
                workOrderRepository.countByStatus(
                        WorkOrder.Status.CLOSED);

        long cancelledWorkOrders =
                workOrderRepository.countByStatus(
                        WorkOrder.Status.CANCELLED);

        long totalCustomers =
                customerRepository.count();

        long totalSites =
                siteRepository.count();

        long totalParts =
                partRepository.count();

        return new DashboardSummaryResponse(
                totalWorkOrders,
                newWorkOrders,
                assignedWorkOrders,
                inProgressWorkOrders,
                onHoldWorkOrders,
                completedWorkOrders,
                closedWorkOrders,
                cancelledWorkOrders,
                totalCustomers,
                totalSites,
                totalParts
        );
    }
}