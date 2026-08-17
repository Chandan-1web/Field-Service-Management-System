package com.fieldservicemanagement.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.fieldservicemanagement.entity.Notification;
import com.fieldservicemanagement.entity.User;
import com.fieldservicemanagement.entity.WorkOrder;
import com.fieldservicemanagement.repository.NotificationRepository;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(
            NotificationRepository notificationRepository) {

        this.notificationRepository =
                notificationRepository;
    }

    // =========================================================
    // CREATE
    // =========================================================

    @Transactional
    public Notification createNotification(
            User recipient,
            WorkOrder workOrder,
            String title,
            String message) {

        if (recipient == null) {
            throw new IllegalArgumentException(
                    "Notification recipient is required"
            );
        }

        Notification notification =
                new Notification();

        notification.setRecipient(recipient);

        notification.setWorkOrder(workOrder);

        notification.setTitle(title);

        notification.setMessage(message);

        notification.setRead(false);

        return notificationRepository.save(
                notification
        );
    }

    // =========================================================
    // CURRENT USER NOTIFICATIONS
    // =========================================================

    @Transactional(readOnly = true)
    public List<Notification>
            getMyNotifications(User user) {

        return notificationRepository
                .findByRecipientOrderByCreatedAtDesc(
                        user
                );
    }

    // =========================================================
    // UNREAD COUNT
    // =========================================================

    @Transactional(readOnly = true)
    public long getUnreadCount(User user) {

        return notificationRepository
                .countByRecipientAndReadFalse(
                        user
                );
    }

    // =========================================================
    // MARK ONE AS READ
    // =========================================================

    @Transactional
    public Notification markAsRead(
            Long notificationId,
            User user) {

        Notification notification =
                notificationRepository
                        .findById(notificationId)
                        .orElseThrow(
                                () ->
                                        new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "Notification not found"
                                        )
                        );

        if (!notification
                .getRecipient()
                .getId()
                .equals(user.getId())) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You cannot access this notification"
            );
        }

        notification.setRead(true);

        return notificationRepository.save(
                notification
        );
    }

    // =========================================================
    // MARK ALL AS READ
    // =========================================================

    @Transactional
    public void markAllAsRead(User user) {

        List<Notification> notifications =
                notificationRepository
                        .findByRecipientOrderByCreatedAtDesc(
                                user
                        );

        notifications.forEach(
                notification ->
                        notification.setRead(true)
        );

        notificationRepository.saveAll(
                notifications
        );
    }
}