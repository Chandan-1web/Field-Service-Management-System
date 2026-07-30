package com.fieldservicemanagement.service;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.fieldservicemanagement.dto.AttachmentResponse;
import com.fieldservicemanagement.entity.User;
import com.fieldservicemanagement.entity.WorkOrder;
import com.fieldservicemanagement.entity.WorkOrderAttachment;
import com.fieldservicemanagement.repository.WorkOrderAttachmentRepository;
import com.fieldservicemanagement.repository.WorkOrderRepository;

@Service
public class WorkOrderAttachmentService {

    private static final long MAX_FILE_SIZE =
            10L * 1024L * 1024L;

    private static final Set<String> ALLOWED_CONTENT_TYPES =
            Set.of(
                    "image/jpeg",
                    "image/png",
                    "application/pdf"
            );

    private static final Set<String> ALLOWED_EXTENSIONS =
            Set.of(
                    ".jpg",
                    ".jpeg",
                    ".png",
                    ".pdf"
            );

    private final WorkOrderAttachmentRepository attachmentRepository;
    private final WorkOrderRepository workOrderRepository;
    private final Path uploadDirectory;

    public WorkOrderAttachmentService(
            WorkOrderAttachmentRepository attachmentRepository,
            WorkOrderRepository workOrderRepository,
            @Value("${app.upload.dir:uploads}")
            String uploadDirectory) {

        this.attachmentRepository = attachmentRepository;
        this.workOrderRepository = workOrderRepository;

        this.uploadDirectory = Paths.get(uploadDirectory)
                .toAbsolutePath()
                .normalize();

        try {
            Files.createDirectories(this.uploadDirectory);
        } catch (IOException exception) {
            throw new IllegalStateException(
                    "Could not create the attachment upload directory.",
                    exception
            );
        }
    }

    @Transactional
    public AttachmentResponse upload(
            Long workOrderId,
            MultipartFile file,
            User currentUser) {

        WorkOrder workOrder = getWorkOrder(workOrderId);

        validateWorkOrderAccess(
                workOrder,
                currentUser
        );

        validateUploadStatus(workOrder);
        validateFile(file);

        String originalFileName =
                cleanFileName(file.getOriginalFilename());

        String extension =
                getExtension(originalFileName).toLowerCase();

        String storedFileName =
                UUID.randomUUID() + extension;

        Path targetPath = uploadDirectory
                .resolve(storedFileName)
                .normalize();

        validateTargetPath(targetPath);

        try {
            Files.copy(
                    file.getInputStream(),
                    targetPath,
                    StandardCopyOption.REPLACE_EXISTING
            );
        } catch (IOException exception) {
            throw new IllegalStateException(
                    "Failed to save the uploaded file.",
                    exception
            );
        }

        WorkOrderAttachment attachment =
                new WorkOrderAttachment();

        attachment.setWorkOrder(workOrder);
        attachment.setUploadedBy(currentUser);
        attachment.setFileName(originalFileName);
        attachment.setStoredFileName(storedFileName);
        attachment.setFileType(file.getContentType());
        attachment.setFileSize(file.getSize());
        attachment.setUploadedAt(LocalDateTime.now());

        WorkOrderAttachment savedAttachment;

        try {
            savedAttachment =
                    attachmentRepository.save(attachment);
        } catch (RuntimeException exception) {

            deleteStoredFileQuietly(targetPath);

            throw exception;
        }

        return mapToResponse(savedAttachment);
    }

    @Transactional(readOnly = true)
    public List<AttachmentResponse> getAttachments(
            Long workOrderId,
            User currentUser) {

        WorkOrder workOrder = getWorkOrder(workOrderId);

        validateWorkOrderAccess(
                workOrder,
                currentUser
        );

        return attachmentRepository
                .findByWorkOrderIdOrderByUploadedAtDesc(
                        workOrderId
                )
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public WorkOrderAttachment getAccessibleAttachment(
            Long attachmentId,
            User currentUser) {

        WorkOrderAttachment attachment =
                attachmentRepository
                        .findById(attachmentId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Attachment not found with ID: "
                                                + attachmentId
                                )
                        );

        validateWorkOrderAccess(
                attachment.getWorkOrder(),
                currentUser
        );

        return attachment;
    }

    public Resource loadFile(
            WorkOrderAttachment attachment) {

        Path filePath = uploadDirectory
                .resolve(attachment.getStoredFileName())
                .normalize();

        validateTargetPath(filePath);

        try {
            Resource resource =
                    new UrlResource(filePath.toUri());

            if (!resource.exists()
                    || !resource.isReadable()) {

                throw new IllegalStateException(
                        "Attachment file was not found on the server."
                );
            }

            return resource;

        } catch (MalformedURLException exception) {

            throw new IllegalStateException(
                    "Could not read the attachment file.",
                    exception
            );
        }
    }

    private WorkOrder getWorkOrder(
            Long workOrderId) {

        return workOrderRepository
                .findById(workOrderId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Work order not found with ID: "
                                        + workOrderId
                        )
                );
    }

    private void validateWorkOrderAccess(
            WorkOrder workOrder,
            User currentUser) {

        if (currentUser.getRole() == User.Role.MANAGER
                || currentUser.getRole()
                == User.Role.DISPATCHER) {

            return;
        }

        if (currentUser.getRole()
                != User.Role.TECHNICIAN) {

            throw new IllegalStateException(
                    "You are not authorized to access attachments."
            );
        }

        if (workOrder.getAssignedTo() == null) {
            throw new IllegalStateException(
                    "This work order is not assigned to a technician."
            );
        }

        boolean assignedTechnician =
                workOrder.getAssignedTo()
                        .getId()
                        .equals(currentUser.getId());

        if (!assignedTechnician) {
            throw new IllegalStateException(
                    "You can access attachments only for "
                            + "work orders assigned to you."
            );
        }
    }

    private void validateUploadStatus(
            WorkOrder workOrder) {

        if (workOrder.getStatus()
                == WorkOrder.Status.CLOSED
                || workOrder.getStatus()
                == WorkOrder.Status.CANCELLED) {

            throw new IllegalStateException(
                    "Attachments cannot be uploaded to "
                            + "closed or cancelled work orders."
            );
        }
    }

    private void validateFile(
            MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException(
                    "Please select a file to upload."
            );
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException(
                    "File size must not exceed 10 MB."
            );
        }

        String contentType = file.getContentType();

        if (contentType == null
                || !ALLOWED_CONTENT_TYPES.contains(
                        contentType.toLowerCase()
                )) {

            throw new IllegalArgumentException(
                    "Only JPG, JPEG, PNG and PDF files are allowed."
            );
        }

        String originalFileName =
                cleanFileName(file.getOriginalFilename());

        String extension =
                getExtension(originalFileName).toLowerCase();

        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new IllegalArgumentException(
                    "Only JPG, JPEG, PNG and PDF files are allowed."
            );
        }
    }

    private String cleanFileName(
            String originalFileName) {

        if (originalFileName == null
                || originalFileName.isBlank()) {

            throw new IllegalArgumentException(
                    "The uploaded file must have a valid name."
            );
        }

        String cleanedName =
                Paths.get(originalFileName)
                        .getFileName()
                        .toString()
                        .trim();

        if (cleanedName.isBlank()) {
            throw new IllegalArgumentException(
                    "The uploaded file must have a valid name."
            );
        }

        return cleanedName;
    }

    private String getExtension(
            String fileName) {

        int lastDotIndex =
                fileName.lastIndexOf('.');

        if (lastDotIndex < 0) {
            return "";
        }

        return fileName.substring(lastDotIndex);
    }

    private void validateTargetPath(
            Path path) {

        if (!path.startsWith(uploadDirectory)) {
            throw new IllegalArgumentException(
                    "Invalid attachment path."
            );
        }
    }

    private void deleteStoredFileQuietly(
            Path targetPath) {

        try {
            Files.deleteIfExists(targetPath);
        } catch (IOException ignored) {
            // The original database exception remains primary.
        }
    }

    private AttachmentResponse mapToResponse(
            WorkOrderAttachment attachment) {

        User uploadedBy =
                attachment.getUploadedBy();

        return new AttachmentResponse(
                attachment.getId(),
                attachment.getWorkOrder().getId(),
                attachment.getFileName(),
                attachment.getFileType(),
                attachment.getFileSize(),
                uploadedBy.getId(),
                uploadedBy.getName(),
                attachment.getUploadedAt(),
                "/api/attachments/"
                        + attachment.getId()
                        + "/download"
        );
    }
}