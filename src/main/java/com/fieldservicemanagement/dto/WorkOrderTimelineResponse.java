package com.fieldservicemanagement.dto;

import java.time.LocalDateTime;

public class WorkOrderTimelineResponse {

    private Long id;
    private String type;
    private String title;
    private String message;
    private String performedBy;
    private LocalDateTime activityTime;

    public WorkOrderTimelineResponse() {
    }

    public WorkOrderTimelineResponse(
            Long id,
            String type,
            String title,
            String message,
            String performedBy,
            LocalDateTime activityTime) {

        this.id = id;
        this.type = type;
        this.title = title;
        this.message = message;
        this.performedBy = performedBy;
        this.activityTime = activityTime;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getPerformedBy() {
        return performedBy;
    }

    public void setPerformedBy(String performedBy) {
        this.performedBy = performedBy;
    }

    public LocalDateTime getActivityTime() {
        return activityTime;
    }

    public void setActivityTime(LocalDateTime activityTime) {
        this.activityTime = activityTime;
    }
}