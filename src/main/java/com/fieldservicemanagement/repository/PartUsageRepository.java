package com.fieldservicemanagement.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.fieldservicemanagement.entity.PartUsage;

public interface PartUsageRepository
        extends JpaRepository<PartUsage, Long> {

    /*
     * Existing method.
     *
     * Keep this because WorkOrderTimelineService
     * is already using it.
     */
    List<PartUsage> findByWorkOrderId(
            Long workOrderId
    );

    /*
     * Used by the Parts Used page when
     * we want newest usage first.
     */
    List<PartUsage> findByWorkOrderIdOrderByUsedAtDesc(
            Long workOrderId
    );

    /*
     * Technician's complete part-usage history.
     */
    @Query("""
            SELECT pu
            FROM PartUsage pu
            WHERE pu.workOrder.assignedTo.id = :technicianId
            ORDER BY pu.usedAt DESC
            """)
    List<PartUsage> findByTechnicianId(
            @Param("technicianId")
            Long technicianId
    );
}