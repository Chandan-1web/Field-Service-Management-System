package com.fieldservicemanagement.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fieldservicemanagement.entity.Notification;
import com.fieldservicemanagement.entity.User;

public interface NotificationRepository
        extends JpaRepository<Notification, Long> {

    List<Notification>
            findByRecipientOrderByCreatedAtDesc(
                    User recipient
            );

    long countByRecipientAndReadFalse(
            User recipient
    );
}