package com.fieldservicemanagement.service;

import java.time.LocalDateTime;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fieldservicemanagement.dto.AssignmentRequest;
import com.fieldservicemanagement.dto.StatusTransitionRequest;
import com.fieldservicemanagement.dto.WorkOrderRequest;
import com.fieldservicemanagement.dto.WorkOrderResponse;
import com.fieldservicemanagement.entity.Customer;
import com.fieldservicemanagement.entity.Site;
import com.fieldservicemanagement.entity.User;
import com.fieldservicemanagement.entity.WorkOrder;
import com.fieldservicemanagement.repository.CustomerRepository;
import com.fieldservicemanagement.repository.SiteRepository;
import com.fieldservicemanagement.repository.UserRepository;
import com.fieldservicemanagement.repository.WorkOrderRepository;

@Service
public class WorkOrderService {

    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
            "id",
            "code",
            "title",
            "priority",
            "status",
            "slaDueAt",
            "createdAt",
            "updatedAt",
            "completedAt",
            "closedAt"
    );

    private final WorkOrderRepository workOrderRepository;
    private final CustomerRepository customerRepository;
    private final SiteRepository siteRepository;
    private final WorkOrderLifecycleService lifecycleService;
    private final UserRepository userRepository;
    private final EmailService emailService;

    public WorkOrderService(
            WorkOrderRepository workOrderRepository,
            CustomerRepository customerRepository,
            SiteRepository siteRepository,
            WorkOrderLifecycleService lifecycleService,
            UserRepository userRepository,
            EmailService emailService) {

        this.workOrderRepository = workOrderRepository;
        this.customerRepository = customerRepository;
        this.siteRepository = siteRepository;
        this.lifecycleService = lifecycleService;
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    @Transactional
    public WorkOrderResponse create(WorkOrderRequest request) {

        Customer customer = customerRepository
                .findById(request.getCustomerId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Customer not found with id: "
                                        + request.getCustomerId()
                        )
                );

        Site site = siteRepository
                .findById(request.getSiteId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Site not found with id: "
                                        + request.getSiteId()
                        )
                );

        if (!site.getCustomer().getId().equals(customer.getId())) {
            throw new IllegalStateException(
                    "The selected site does not belong to the selected customer."
            );
        }

        Set<WorkOrder.Status> activeStatuses = EnumSet.of(
                WorkOrder.Status.NEW,
                WorkOrder.Status.ASSIGNED,
                WorkOrder.Status.IN_PROGRESS,
                WorkOrder.Status.ON_HOLD
        );

        boolean duplicateExists =
                workOrderRepository
                        .existsByCustomerIdAndSiteIdAndTitleIgnoreCaseAndStatusIn(
                                customer.getId(),
                                site.getId(),
                                request.getTitle(),
                                activeStatuses
                        );

        if (duplicateExists) {
            throw new IllegalStateException(
                    "An active work order with the same title already exists "
                            + "for this customer and site."
            );
        }

        WorkOrder.Priority priority = parsePriority(
                request.getPriority()
        );

        WorkOrder workOrder = new WorkOrder();

        workOrder.setCode(generateCode());
        workOrder.setTitle(request.getTitle());
        workOrder.setDescription(request.getDescription());
        workOrder.setPriority(priority);
        workOrder.setStatus(WorkOrder.Status.NEW);
        workOrder.setCustomer(customer);
        workOrder.setSite(site);
        workOrder.setSlaDueAt(calculateSlaDueDate(priority));
        workOrder.setCreatedAt(LocalDateTime.now());
        workOrder.setUpdatedAt(LocalDateTime.now());

        WorkOrder saved = workOrderRepository.save(workOrder);

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<WorkOrderResponse> getAll() {

        return workOrderRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<WorkOrderResponse> getMyAssignedWorkOrders(
            User currentUser) {

        return workOrderRepository
                .findByAssignedToId(currentUser.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<WorkOrderResponse> getByStatus(
            String status) {

        WorkOrder.Status statusEnum =
                parseStatus(status);

        return workOrderRepository
                .findByStatus(statusEnum)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<WorkOrderResponse> search(
            String keyword,
            String status,
            String priority,
            Long customerId,
            Long siteId,
            Long technicianId,
            LocalDateTime createdFrom,
            LocalDateTime createdTo,
            int page,
            int size,
            String sortBy,
            String sortDirection) {

        validatePagination(page, size);

        String validatedSortField =
                validateSortField(sortBy);

        Sort.Direction direction =
                parseSortDirection(sortDirection);

        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(direction, validatedSortField)
        );

        WorkOrder.Status statusEnum = null;
        WorkOrder.Priority priorityEnum = null;

        if (status != null && !status.isBlank()) {
            statusEnum = parseStatus(status);
        }

        if (priority != null && !priority.isBlank()) {
            priorityEnum = parsePriority(priority);
        }

        if (createdFrom != null
                && createdTo != null
                && createdFrom.isAfter(createdTo)) {

            throw new IllegalArgumentException(
                    "createdFrom cannot be after createdTo."
            );
        }

        WorkOrder.Status finalStatus = statusEnum;
        WorkOrder.Priority finalPriority = priorityEnum;

        Specification<WorkOrder> specification =
                (root, query, criteriaBuilder) ->
                        criteriaBuilder.conjunction();

        if (keyword != null && !keyword.isBlank()) {

            String searchValue =
                    "%" + keyword.trim().toLowerCase() + "%";

            specification = specification.and(
                    (root, query, criteriaBuilder) ->
                            criteriaBuilder.or(
                                    criteriaBuilder.like(
                                            criteriaBuilder.lower(
                                                    root.get("title")
                                            ),
                                            searchValue
                                    ),
                                    criteriaBuilder.like(
                                            criteriaBuilder.lower(
                                                    root.get("code")
                                            ),
                                            searchValue
                                    ),
                                    criteriaBuilder.like(
                                            criteriaBuilder.lower(
                                                    root.get("description")
                                            ),
                                            searchValue
                                    )
                            )
            );
        }

        if (finalStatus != null) {
            specification = specification.and(
                    (root, query, criteriaBuilder) ->
                            criteriaBuilder.equal(
                                    root.get("status"),
                                    finalStatus
                            )
            );
        }

        if (finalPriority != null) {
            specification = specification.and(
                    (root, query, criteriaBuilder) ->
                            criteriaBuilder.equal(
                                    root.get("priority"),
                                    finalPriority
                            )
            );
        }

        if (customerId != null) {
            specification = specification.and(
                    (root, query, criteriaBuilder) ->
                            criteriaBuilder.equal(
                                    root.get("customer").get("id"),
                                    customerId
                            )
            );
        }

        if (siteId != null) {
            specification = specification.and(
                    (root, query, criteriaBuilder) ->
                            criteriaBuilder.equal(
                                    root.get("site").get("id"),
                                    siteId
                            )
            );
        }

        if (technicianId != null) {
            specification = specification.and(
                    (root, query, criteriaBuilder) ->
                            criteriaBuilder.equal(
                                    root.get("assignedTo").get("id"),
                                    technicianId
                            )
            );
        }

        if (createdFrom != null) {
            specification = specification.and(
                    (root, query, criteriaBuilder) ->
                            criteriaBuilder.greaterThanOrEqualTo(
                                    root.<LocalDateTime>get("createdAt"),
                                    createdFrom
                            )
            );
        }

        if (createdTo != null) {
            specification = specification.and(
                    (root, query, criteriaBuilder) ->
                            criteriaBuilder.lessThanOrEqualTo(
                                    root.<LocalDateTime>get("createdAt"),
                                    createdTo
                            )
            );
        }

        Page<WorkOrder> resultPage =
                workOrderRepository.findAll(
                        specification,
                        pageable
                );

        return resultPage.map(this::toResponse);
    }

    @Transactional
    public WorkOrderResponse transitionStatus(
            Long id,
            StatusTransitionRequest request,
            User currentUser) {

        WorkOrder.Status newStatus =
                parseStatus(request.getNewStatus());

        WorkOrder workOrder = workOrderRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Work order not found with id: " + id
                        )
                );

        validateRoleForTransition(
                workOrder,
                newStatus,
                currentUser
        );

        WorkOrder updated = lifecycleService.transition(
                id,
                newStatus,
                currentUser,
                request.getNote()
        );

        return toResponse(updated);
    }

    private void validateRoleForTransition(
            WorkOrder workOrder,
            WorkOrder.Status newStatus,
            User currentUser) {

        String role = currentUser.getRole().name();

        if (newStatus == WorkOrder.Status.CLOSED
                && !role.equals("MANAGER")) {

            throw new IllegalStateException(
                    "Only a Manager can close a work order."
            );
        }

        if (newStatus == WorkOrder.Status.IN_PROGRESS) {

            boolean isAssignedTechnician =
                    workOrder.getAssignedTo() != null
                            && workOrder.getAssignedTo()
                            .getId()
                            .equals(currentUser.getId());

            boolean isManager = role.equals("MANAGER");

            if (!isAssignedTechnician && !isManager) {
                throw new IllegalStateException(
                        "Only the assigned technician or a manager "
                                + "can start this job."
                );
            }
        }

        if (newStatus == WorkOrder.Status.COMPLETED) {

            boolean isAssignedTechnician =
                    workOrder.getAssignedTo() != null
                            && workOrder.getAssignedTo()
                            .getId()
                            .equals(currentUser.getId());

            if (!isAssignedTechnician) {
                throw new IllegalStateException(
                        "Only the assigned technician can complete "
                                + "this work order."
                );
            }
        }
    }

    @Transactional
    public WorkOrderResponse assignTechnician(
            Long workOrderId,
            AssignmentRequest request,
            User assignedBy) {

        WorkOrder workOrder = workOrderRepository
                .findById(workOrderId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Work order not found with id: "
                                        + workOrderId
                        )
                );

        User technician = userRepository
                .findById(request.getTechnicianId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found with id: "
                                        + request.getTechnicianId()
                        )
                );

        if (technician.getRole() != User.Role.TECHNICIAN) {
            throw new IllegalStateException(
                    "Selected user is not a technician."
            );
        }

        if (workOrder.getStatus() == WorkOrder.Status.CLOSED
                || workOrder.getStatus()
                == WorkOrder.Status.CANCELLED) {

            throw new IllegalStateException(
                    "Closed or cancelled work orders cannot be assigned."
            );
        }

        workOrder.setAssignedTo(technician);
        workOrder.setUpdatedAt(LocalDateTime.now());

        WorkOrder savedWorkOrder;

        if (workOrder.getStatus() == WorkOrder.Status.NEW) {

            workOrderRepository.save(workOrder);

            String note = request.getNote();

            if (note == null || note.isBlank()) {
                note = "Assigned to technician "
                        + technician.getName();
            }

            savedWorkOrder =
                    lifecycleService.transition(
                            workOrderId,
                            WorkOrder.Status.ASSIGNED,
                            assignedBy,
                            note
                    );

        } else {
            savedWorkOrder =
                    workOrderRepository.save(workOrder);
        }

        sendAssignmentNotification(
                savedWorkOrder,
                technician,
                assignedBy
        );

        return toResponse(savedWorkOrder);
    }

    @Transactional(readOnly = true)
    public WorkOrderResponse getById(Long id) {

        WorkOrder workOrder = workOrderRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Work order not found with id: " + id
                        )
                );

        return toResponse(workOrder);
    }

    private WorkOrder.Status parseStatus(
            String status) {

        if (status == null || status.isBlank()) {
            throw new IllegalArgumentException(
                    "Status cannot be empty."
            );
        }

        try {
            return WorkOrder.Status.valueOf(
                    status.trim().toUpperCase()
            );

        } catch (IllegalArgumentException exception) {
            throw new IllegalArgumentException(
                    "Invalid status: " + status
            );
        }
    }

    private WorkOrder.Priority parsePriority(
            String priority) {

        if (priority == null || priority.isBlank()) {
            throw new IllegalArgumentException(
                    "Priority cannot be empty."
            );
        }

        try {
            return WorkOrder.Priority.valueOf(
                    priority.trim().toUpperCase()
            );

        } catch (IllegalArgumentException exception) {
            throw new IllegalArgumentException(
                    "Invalid priority: " + priority
            );
        }
    }

    private void validatePagination(
            int page,
            int size) {

        if (page < 0) {
            throw new IllegalArgumentException(
                    "Page number cannot be negative."
            );
        }

        if (size < 1 || size > 100) {
            throw new IllegalArgumentException(
                    "Page size must be between 1 and 100."
            );
        }
    }

    private String validateSortField(
            String sortBy) {

        if (sortBy == null || sortBy.isBlank()) {
            return "createdAt";
        }

        if (!ALLOWED_SORT_FIELDS.contains(sortBy)) {
            throw new IllegalArgumentException(
                    "Invalid sort field: " + sortBy
            );
        }

        return sortBy;
    }

    private Sort.Direction parseSortDirection(
            String sortDirection) {

        if (sortDirection == null
                || sortDirection.isBlank()
                || sortDirection.equalsIgnoreCase("desc")) {

            return Sort.Direction.DESC;
        }

        if (sortDirection.equalsIgnoreCase("asc")) {
            return Sort.Direction.ASC;
        }

        throw new IllegalArgumentException(
                "Sort direction must be 'asc' or 'desc'."
        );
    }

    private String generateCode() {

        long count = workOrderRepository.count() + 1;

        return String.format("WO-%06d", count);
    }

    private LocalDateTime calculateSlaDueDate(
            WorkOrder.Priority priority) {

        LocalDateTime now = LocalDateTime.now();

        return switch (priority) {
            case CRITICAL -> now.plusHours(4);
            case HIGH -> now.plusHours(24);
            case MEDIUM -> now.plusDays(3);
            case LOW -> now.plusDays(7);
        };
    }

    private void sendAssignmentNotification(
            WorkOrder workOrder,
            User technician,
            User assignedBy) {

        try {
            String subject =
                    "New Work Order Assigned - "
                            + workOrder.getCode();

            String body =
                    "Hello "
                            + technician.getName()
                            + ",\n\n"
                            + "A new work order has been assigned to you.\n\n"
                            + "Work Order Code: "
                            + workOrder.getCode()
                            + "\n"
                            + "Title: "
                            + workOrder.getTitle()
                            + "\n"
                            + "Description: "
                            + workOrder.getDescription()
                            + "\n"
                            + "Customer: "
                            + workOrder.getCustomer().getName()
                            + "\n"
                            + "Site: "
                            + workOrder.getSite().getName()
                            + "\n"
                            + "Priority: "
                            + workOrder.getPriority().name()
                            + "\n"
                            + "SLA Due At: "
                            + workOrder.getSlaDueAt()
                            + "\n"
                            + "Assigned By: "
                            + assignedBy.getName()
                            + "\n\n"
                            + "Please log in to the Field Service "
                            + "Management System for more details.";

            emailService.sendSimpleEmail(
                    technician.getEmail(),
                    subject,
                    body
            );

        } catch (Exception exception) {
            System.err.println(
                    "Work order was assigned, but assignment email failed: "
                            + exception.getMessage()
            );
        }
    }

    private WorkOrderResponse toResponse(
            WorkOrder workOrder) {

        return new WorkOrderResponse(
                workOrder.getId(),
                workOrder.getCode(),
                workOrder.getTitle(),
                workOrder.getDescription(),
                workOrder.getPriority().name(),
                workOrder.getStatus().name(),

                workOrder.getCustomer().getId(),
                workOrder.getCustomer().getName(),

                workOrder.getSite().getId(),
                workOrder.getSite().getName(),

                workOrder.getAssignedTo() != null
                        ? workOrder.getAssignedTo().getName()
                        : null,

                workOrder.getSlaDueAt(),
                workOrder.getCreatedAt(),

                workOrder.getCompletedAt(),
                workOrder.getCompletionNote(),

                workOrder.getClosedAt(),
                workOrder.getClosureNote()
        );
    }
}