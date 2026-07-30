package com.fieldservicemanagement.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fieldservicemanagement.entity.WorkOrderAttachment;

public interface WorkOrderAttachmentRepository
        extends JpaRepository<WorkOrderAttachment, Long> {

    List<WorkOrderAttachment>
            findByWorkOrderIdOrderByUploadedAtDesc(Long workOrderId);
}