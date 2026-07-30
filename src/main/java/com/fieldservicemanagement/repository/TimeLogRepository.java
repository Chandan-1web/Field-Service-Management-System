package com.fieldservicemanagement.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.fieldservicemanagement.entity.TimeLog;

public interface TimeLogRepository
        extends JpaRepository<TimeLog, Long> {

    List<TimeLog> findByWorkOrderId(
            Long workOrderId);

    @Query("""
            SELECT COALESCE(SUM(t.minutes), 0)
            FROM TimeLog t
            WHERE t.technician.id = :technicianId
            """)
    Long getTotalMinutesByTechnicianId(
            @Param("technicianId") Long technicianId);
}