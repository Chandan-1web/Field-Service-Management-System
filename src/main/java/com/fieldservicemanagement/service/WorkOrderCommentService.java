package com.fieldservicemanagement.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fieldservicemanagement.dto.CommentRequest;
import com.fieldservicemanagement.dto.CommentResponse;
import com.fieldservicemanagement.entity.User;
import com.fieldservicemanagement.entity.WorkOrder;
import com.fieldservicemanagement.entity.WorkOrderComment;
import com.fieldservicemanagement.repository.WorkOrderCommentRepository;
import com.fieldservicemanagement.repository.WorkOrderRepository;

@Service
public class WorkOrderCommentService {

    private final WorkOrderCommentRepository commentRepository;
    private final WorkOrderRepository workOrderRepository;

    public WorkOrderCommentService(
            WorkOrderCommentRepository commentRepository,
            WorkOrderRepository workOrderRepository) {

        this.commentRepository = commentRepository;
        this.workOrderRepository = workOrderRepository;
    }

    @Transactional
    public CommentResponse addComment(
            Long workOrderId,
            CommentRequest request,
            User currentUser) {

        WorkOrder workOrder = workOrderRepository
                .findById(workOrderId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Work order not found with id: " + workOrderId));

        WorkOrderComment comment = new WorkOrderComment();

        comment.setWorkOrder(workOrder);
        comment.setUser(currentUser);
        comment.setComment(request.getComment());
        comment.setCreatedAt(LocalDateTime.now());

        WorkOrderComment saved = commentRepository.save(comment);

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> getComments(Long workOrderId) {

        return commentRepository
                .findByWorkOrderIdOrderByCreatedAtAsc(workOrderId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private CommentResponse toResponse(WorkOrderComment comment) {

        return new CommentResponse(
                comment.getId(),
                comment.getUser().getName(),
                comment.getUser().getRole().name(),
                comment.getComment(),
                comment.getCreatedAt()
        );
    }
}