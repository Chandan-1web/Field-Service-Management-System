
package com.fieldservicemanagement.dto;

import java.time.LocalDateTime;

public class AttachmentResponse {

    private Long id;
    private Long workOrderId;
    private String fileName;
    private String fileType;
    private Long fileSize;
    private Long uploadedById;
    private String uploadedByName;
    private LocalDateTime uploadedAt;
    private String downloadUrl;

    public AttachmentResponse() {
    }

    public AttachmentResponse(
            Long id,
            Long workOrderId,
            String fileName,
            String fileType,
            Long fileSize,
            Long uploadedById,
            String uploadedByName,
            LocalDateTime uploadedAt,
            String downloadUrl) {

        this.id = id;
        this.workOrderId = workOrderId;
        this.fileName = fileName;
        this.fileType = fileType;
        this.fileSize = fileSize;
        this.uploadedById = uploadedById;
        this.uploadedByName = uploadedByName;
        this.uploadedAt = uploadedAt;
        this.downloadUrl = downloadUrl;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getWorkOrderId() {
        return workOrderId;
    }

    public void setWorkOrderId(Long workOrderId) {
        this.workOrderId = workOrderId;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFileType() {
        return fileType;
    }

    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public Long getUploadedById() {
        return uploadedById;
    }

    public void setUploadedById(Long uploadedById) {
        this.uploadedById = uploadedById;
    }

    public String getUploadedByName() {
        return uploadedByName;
    }

    public void setUploadedByName(String uploadedByName) {
        this.uploadedByName = uploadedByName;
    }

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(LocalDateTime uploadedAt) {
        this.uploadedAt = uploadedAt;
    }

    public String getDownloadUrl() {
        return downloadUrl;
    }

    public void setDownloadUrl(String downloadUrl) {
        this.downloadUrl = downloadUrl;
    }
}