package com.fieldservicemanagement.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fieldservicemanagement.dto.CommentRequest;
import com.fieldservicemanagement.dto.CommentResponse;
import com.fieldservicemanagement.entity.User;
import com.fieldservicemanagement.repository.UserRepository;
import com.fieldservicemanagement.service.WorkOrderCommentService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/work-orders")
public class WorkOrderCommentController {

    private final WorkOrderCommentService commentService;
    private final UserRepository userRepository;

    public WorkOrderCommentController(
            WorkOrderCommentService commentService,
            UserRepository userRepository) {

        this.commentService = commentService;
        this.userRepository = userRepository;
    }

    @PostMapping("/{workOrderId}/comments")
    @PreAuthorize(
            "hasAnyRole('MANAGER', 'DISPATCHER', 'TECHNICIAN')")
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable Long workOrderId,
            @Valid @RequestBody CommentRequest request,
            Authentication authentication) {

        User currentUser = userRepository
                .findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Logged-in user not found"));

        CommentResponse response =
                commentService.addComment(
                        workOrderId,
                        request,
                        currentUser);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{workOrderId}/comments")
    @PreAuthorize(
            "hasAnyRole('MANAGER', 'DISPATCHER', 'TECHNICIAN')")
    public ResponseEntity<List<CommentResponse>> getComments(
            @PathVariable Long workOrderId) {

        List<CommentResponse> response =
                commentService.getComments(workOrderId);

        return ResponseEntity.ok(response);
    }
}