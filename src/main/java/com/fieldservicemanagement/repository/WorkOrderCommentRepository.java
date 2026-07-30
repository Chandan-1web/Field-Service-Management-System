package com.fieldservicemanagement.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fieldservicemanagement.entity.WorkOrderComment;

public interface WorkOrderCommentRepository
        extends JpaRepository<WorkOrderComment, Long> {

    List<WorkOrderComment>
        findByWorkOrderIdOrderByCreatedAtAsc(Long workOrderId);
}