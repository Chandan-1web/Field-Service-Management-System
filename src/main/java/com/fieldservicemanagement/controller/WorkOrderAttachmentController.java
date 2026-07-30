package com.fieldservicemanagement.controller;

import java.nio.charset.StandardCharsets;
import java.util.List;

import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fieldservicemanagement.dto.AttachmentResponse;
import com.fieldservicemanagement.entity.User;
import com.fieldservicemanagement.entity.WorkOrderAttachment;
import com.fieldservicemanagement.repository.UserRepository;
import com.fieldservicemanagement.service.WorkOrderAttachmentService;

@RestController
@RequestMapping("/api")
public class WorkOrderAttachmentController {

    private final WorkOrderAttachmentService attachmentService;
    private final UserRepository userRepository;

    public WorkOrderAttachmentController(
            WorkOrderAttachmentService attachmentService,
            UserRepository userRepository) {

        this.attachmentService = attachmentService;
        this.userRepository = userRepository;
    }

    @PostMapping(
            value = "/work-orders/{workOrderId}/attachments",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @PreAuthorize(
            "hasAnyRole('MANAGER', 'DISPATCHER', 'TECHNICIAN')"
    )
    public ResponseEntity<AttachmentResponse> uploadAttachment(
            @PathVariable Long workOrderId,
            @RequestPart("file") MultipartFile file,
            Authentication authentication) {

        User currentUser = getCurrentUser(authentication);

        AttachmentResponse response =
                attachmentService.upload(
                        workOrderId,
                        file,
                        currentUser
                );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/work-orders/{workOrderId}/attachments")
    @PreAuthorize(
            "hasAnyRole('MANAGER', 'DISPATCHER', 'TECHNICIAN')"
    )
    public ResponseEntity<List<AttachmentResponse>> getAttachments(
            @PathVariable Long workOrderId,
            Authentication authentication) {

        User currentUser = getCurrentUser(authentication);

        List<AttachmentResponse> response =
                attachmentService.getAttachments(
                        workOrderId,
                        currentUser
                );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/attachments/{attachmentId}/download")
    @PreAuthorize(
            "hasAnyRole('MANAGER', 'DISPATCHER', 'TECHNICIAN')"
    )
    public ResponseEntity<Resource> downloadAttachment(
            @PathVariable Long attachmentId,
            Authentication authentication) {

        User currentUser = getCurrentUser(authentication);

        WorkOrderAttachment attachment =
                attachmentService.getAccessibleAttachment(
                        attachmentId,
                        currentUser
                );

        Resource resource =
                attachmentService.loadFile(attachment);

        MediaType mediaType;

        try {
            mediaType = MediaType.parseMediaType(
                    attachment.getFileType()
            );
        } catch (Exception exception) {
            mediaType = MediaType.APPLICATION_OCTET_STREAM;
        }

        ContentDisposition contentDisposition =
                ContentDisposition.attachment()
                        .filename(
                                attachment.getFileName(),
                                StandardCharsets.UTF_8
                        )
                        .build();

        return ResponseEntity.ok()
                .contentType(mediaType)
                .contentLength(attachment.getFileSize())
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        contentDisposition.toString()
                )
                .body(resource);
    }

    private User getCurrentUser(
            Authentication authentication) {

        return userRepository
                .findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Logged-in user was not found."
                        )
                );
    }
}