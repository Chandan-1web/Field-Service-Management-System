package com.fieldservicemanagement.service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fieldservicemanagement.dto.WorkOrderTimelineResponse;
import com.fieldservicemanagement.entity.PartUsage;
import com.fieldservicemanagement.entity.TimeLog;
import com.fieldservicemanagement.entity.User;
import com.fieldservicemanagement.entity.WorkOrder;
import com.fieldservicemanagement.entity.WorkOrderAttachment;
import com.fieldservicemanagement.entity.WorkOrderComment;
import com.fieldservicemanagement.entity.WorkOrderStatusHistory;
import com.fieldservicemanagement.repository.PartUsageRepository;
import com.fieldservicemanagement.repository.TimeLogRepository;
import com.fieldservicemanagement.repository.WorkOrderAttachmentRepository;
import com.fieldservicemanagement.repository.WorkOrderCommentRepository;
import com.fieldservicemanagement.repository.WorkOrderRepository;
import com.fieldservicemanagement.repository.WorkOrderStatusHistoryRepository;

@Service
public class WorkOrderTimelineService {

    private final WorkOrderRepository workOrderRepository;

    private final WorkOrderStatusHistoryRepository
            statusHistoryRepository;

    private final WorkOrderCommentRepository
            commentRepository;

    private final WorkOrderAttachmentRepository
            attachmentRepository;

    private final TimeLogRepository
            timeLogRepository;

    private final PartUsageRepository
            partUsageRepository;

    public WorkOrderTimelineService(
            WorkOrderRepository workOrderRepository,
            WorkOrderStatusHistoryRepository statusHistoryRepository,
            WorkOrderCommentRepository commentRepository,
            WorkOrderAttachmentRepository attachmentRepository,
            TimeLogRepository timeLogRepository,
            PartUsageRepository partUsageRepository) {

        this.workOrderRepository = workOrderRepository;
        this.statusHistoryRepository = statusHistoryRepository;
        this.commentRepository = commentRepository;
        this.attachmentRepository = attachmentRepository;
        this.timeLogRepository = timeLogRepository;
        this.partUsageRepository = partUsageRepository;
    }

    @Transactional(readOnly = true)
    public List<WorkOrderTimelineResponse> getTimeline(
            Long workOrderId) {

        WorkOrder workOrder = workOrderRepository
                .findById(workOrderId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Work order not found with id: "
                                        + workOrderId
                        )
                );

        List<WorkOrderTimelineResponse> timeline =
                new ArrayList<>();

        addWorkOrderCreatedActivity(
                workOrder,
                timeline
        );

        addStatusHistoryActivities(
                workOrderId,
                timeline
        );

        addCommentActivities(
                workOrderId,
                timeline
        );

        addAttachmentActivities(
                workOrderId,
                timeline
        );

        addTimeLogActivities(
                workOrderId,
                timeline
        );

        addPartUsageActivities(
                workOrderId,
                timeline
        );

        timeline.sort(
                Comparator.comparing(
                        WorkOrderTimelineResponse::getActivityTime,
                        Comparator.nullsLast(
                                Comparator.reverseOrder()
                        )
                )
        );

        return timeline;
    }

    private void addWorkOrderCreatedActivity(
            WorkOrder workOrder,
            List<WorkOrderTimelineResponse> timeline) {

        String message =
                "Work order "
                        + workOrder.getCode()
                        + " was created with priority "
                        + workOrder.getPriority().name()
                        + ".";

        WorkOrderTimelineResponse activity =
                new WorkOrderTimelineResponse(
                        workOrder.getId(),
                        "WORK_ORDER_CREATED",
                        "Work Order Created",
                        message,
                        "System",
                        workOrder.getCreatedAt()
                );

        timeline.add(activity);
    }

    private void addStatusHistoryActivities(
            Long workOrderId,
            List<WorkOrderTimelineResponse> timeline) {

        List<WorkOrderStatusHistory> histories =
                statusHistoryRepository
                        .findByWorkOrderIdOrderByChangedAtAsc(
                                workOrderId
                        );

        for (WorkOrderStatusHistory history : histories) {

            String performedBy =
                    getUserName(history.getChangedBy());

            String message =
                    buildStatusMessage(history);

            WorkOrderTimelineResponse activity =
                    new WorkOrderTimelineResponse(
                            history.getId(),
                            "STATUS_CHANGE",
                            "Status Changed",
                            message,
                            performedBy,
                            history.getChangedAt()
                    );

            timeline.add(activity);
        }
    }

    private String buildStatusMessage(
            WorkOrderStatusHistory history) {

        StringBuilder message =
                new StringBuilder();

        if (history.getFromStatus() == null
                || history.getFromStatus().isBlank()) {

            message.append("Status changed to ")
                    .append(history.getToStatus());

        } else {

            message.append("Status changed from ")
                    .append(history.getFromStatus())
                    .append(" to ")
                    .append(history.getToStatus());
        }

        if (history.getNote() != null
                && !history.getNote().isBlank()) {

            message.append(". Note: ")
                    .append(history.getNote());
        }

        return message.toString();
    }

    private void addCommentActivities(
            Long workOrderId,
            List<WorkOrderTimelineResponse> timeline) {

        List<WorkOrderComment> comments =
                commentRepository
                        .findByWorkOrderIdOrderByCreatedAtAsc(
                                workOrderId
                        );

        for (WorkOrderComment comment : comments) {

            String performedBy =
                    getUserName(comment.getUser());

            String message =
                    "Comment added: "
                            + comment.getComment();

            WorkOrderTimelineResponse activity =
                    new WorkOrderTimelineResponse(
                            comment.getId(),
                            "COMMENT",
                            "Comment Added",
                            message,
                            performedBy,
                            comment.getCreatedAt()
                    );

            timeline.add(activity);
        }
    }

    private void addAttachmentActivities(
            Long workOrderId,
            List<WorkOrderTimelineResponse> timeline) {

        List<WorkOrderAttachment> attachments =
                attachmentRepository
                        .findByWorkOrderIdOrderByUploadedAtDesc(
                                workOrderId
                        );

        for (WorkOrderAttachment attachment : attachments) {

            String performedBy =
                    getUserName(
                            attachment.getUploadedBy()
                    );

            StringBuilder message =
                    new StringBuilder();

            message.append("File uploaded: ")
                    .append(attachment.getFileName());

            if (attachment.getFileType() != null
                    && !attachment.getFileType().isBlank()) {

                message.append(" (")
                        .append(attachment.getFileType())
                        .append(")");
            }

            WorkOrderTimelineResponse activity =
                    new WorkOrderTimelineResponse(
                            attachment.getId(),
                            "ATTACHMENT",
                            "Attachment Uploaded",
                            message.toString(),
                            performedBy,
                            attachment.getUploadedAt()
                    );

            timeline.add(activity);
        }
    }

    private void addTimeLogActivities(
            Long workOrderId,
            List<WorkOrderTimelineResponse> timeline) {

        List<TimeLog> timeLogs =
                timeLogRepository
                        .findByWorkOrderId(workOrderId);

        for (TimeLog timeLog : timeLogs) {

            String performedBy =
                    getUserName(
                            timeLog.getTechnician()
                    );

            StringBuilder message =
                    new StringBuilder();

            message.append("Logged ")
                    .append(timeLog.getMinutes())
                    .append(" minutes of work");

            if (timeLog.getNote() != null
                    && !timeLog.getNote().isBlank()) {

                message.append(". Note: ")
                        .append(timeLog.getNote());
            }

            WorkOrderTimelineResponse activity =
                    new WorkOrderTimelineResponse(
                            timeLog.getId(),
                            "TIME_LOG",
                            "Time Logged",
                            message.toString(),
                            performedBy,
                            timeLog.getLoggedAt()
                    );

            timeline.add(activity);
        }
    }

    private void addPartUsageActivities(
            Long workOrderId,
            List<WorkOrderTimelineResponse> timeline) {

        List<PartUsage> partUsages =
                partUsageRepository
                        .findByWorkOrderId(workOrderId);

        for (PartUsage partUsage : partUsages) {

            String message =
                    "Used part ID "
                            + partUsage.getPart().getId()
                            + ", quantity: "
                            + partUsage.getQtyUsed();

            WorkOrderTimelineResponse activity =
                    new WorkOrderTimelineResponse(
                            partUsage.getId(),
                            "PART_USAGE",
                            "Part Used",
                            message,
                            "System",
                            partUsage.getUsedAt()
                    );

            timeline.add(activity);
        }
    }

    private String getUserName(User user) {

        if (user == null) {
            return "System";
        }

        if (user.getName() == null
                || user.getName().isBlank()) {

            return user.getEmail();
        }

        return user.getName();
    }
}