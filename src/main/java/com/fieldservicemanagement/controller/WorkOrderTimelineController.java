package com.fieldservicemanagement.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fieldservicemanagement.dto.WorkOrderTimelineResponse;
import com.fieldservicemanagement.service.WorkOrderTimelineService;

@RestController
@RequestMapping("/api/work-orders")
public class WorkOrderTimelineController {

    private final WorkOrderTimelineService timelineService;

    public WorkOrderTimelineController(
            WorkOrderTimelineService timelineService) {

        this.timelineService = timelineService;
    }

    @GetMapping("/{workOrderId}/timeline")
    public ResponseEntity<List<WorkOrderTimelineResponse>>
            getWorkOrderTimeline(
                    @PathVariable Long workOrderId) {

        List<WorkOrderTimelineResponse> timeline =
                timelineService.getTimeline(workOrderId);

        return ResponseEntity.ok(timeline);
    }
}