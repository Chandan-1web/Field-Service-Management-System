package com.fieldservicemanagement.controller;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fieldservicemanagement.entity.Notification;
import com.fieldservicemanagement.entity.User;
import com.fieldservicemanagement.entity.WorkOrder;
import com.fieldservicemanagement.service.NotificationService;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(
            NotificationService notificationService) {

        this.notificationService = notificationService;
    }

    // =========================================================
    // MY NOTIFICATIONS
    // =========================================================

    @GetMapping
    public List<Map<String, Object>> getMyNotifications(
            @AuthenticationPrincipal User user) {

        return notificationService
                .getMyNotifications(user)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // =========================================================
    // UNREAD COUNT
    // =========================================================

    @GetMapping("/unread-count")
    public Map<String, Long> getUnreadCount(
            @AuthenticationPrincipal User user) {

        return Map.of(
                "count",
                notificationService.getUnreadCount(user)
        );
    }

    // =========================================================
    // MARK ONE READ
    // =========================================================

    @PatchMapping("/{notificationId}/read")
    public Map<String, Object> markAsRead(
            @PathVariable Long notificationId,
            @AuthenticationPrincipal User user) {

        Notification notification =
                notificationService.markAsRead(
                        notificationId,
                        user
                );

        return toResponse(notification);
    }

    // =========================================================
    // MARK ALL READ
    // =========================================================

    @PatchMapping("/read-all")
    public Map<String, String> markAllAsRead(
            @AuthenticationPrincipal User user) {

        notificationService.markAllAsRead(user);

        return Map.of(
                "message",
                "All notifications marked as read."
        );
    }

    // =========================================================
    // RESPONSE
    // =========================================================

    private Map<String, Object> toResponse(
            Notification notification) {

        Map<String, Object> response =
                new LinkedHashMap<>();

        response.put(
                "id",
                notification.getId()
        );

        response.put(
                "title",
                notification.getTitle()
        );

        response.put(
                "message",
                notification.getMessage()
        );

        response.put(
                "read",
                notification.isRead()
        );

        response.put(
                "createdAt",
                notification.getCreatedAt()
        );

        WorkOrder workOrder =
                notification.getWorkOrder();

        if (workOrder != null) {

            response.put(
                    "workOrderId",
                    workOrder.getId()
            );

            response.put(
                    "workOrderCode",
                    workOrder.getCode()
            );

        } else {

            response.put(
                    "workOrderId",
                    null
            );

            response.put(
                    "workOrderCode",
                    null
            );
        }

        return response;
    }
}