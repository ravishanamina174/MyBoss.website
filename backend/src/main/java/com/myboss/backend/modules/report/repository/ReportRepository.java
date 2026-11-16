
package com.myboss.backend.modules.report.repository;

import com.myboss.backend.modules.task.entity.TaskEntity;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface ReportRepository extends Repository<TaskEntity, UUID> {

    @Query(value = """
            SELECT
              COUNT(*),
              COUNT(*) FILTER (WHERE status = 'PENDING'),
              COUNT(*) FILTER (WHERE status = 'COMPLETED'),
              COUNT(*) FILTER (WHERE status = 'CANCELLED')
            FROM tasks
            WHERE business_id = :businessId
              AND deleted_at IS NULL
              AND created_at >= :from AND created_at < :to
            """, nativeQuery = true)
    List<Object[]> summary(
            @Param("businessId") UUID businessId,
            @Param("from") Instant from,
            @Param("to") Instant to
    );

    @Query(value = """
            SELECT DATE(created_at), COUNT(*),
              COUNT(*) FILTER (WHERE status = 'COMPLETED')
            FROM tasks
            WHERE business_id = :businessId
              AND deleted_at IS NULL
              AND created_at >= :from AND created_at < :to
            GROUP BY DATE(created_at)
            ORDER BY DATE(created_at)
            """, nativeQuery = true)
    List<Object[]> activity(
            @Param("businessId") UUID businessId,
            @Param("from") Instant from,
            @Param("to") Instant to
    );

    @Query(value = """
            SELECT m.id, u.full_name, u.email,
              COUNT(t.id) FILTER (WHERE t.assigned_to_membership_id = m.id),
              COUNT(t.id) FILTER (WHERE t.completed_by_membership_id = m.id)
            FROM business_memberships m
            JOIN users u ON u.id = m.user_id
            LEFT JOIN tasks t ON t.business_id = m.business_id
              AND t.deleted_at IS NULL
              AND t.created_at >= :from AND t.created_at < :to
            WHERE m.business_id = :businessId
              AND m.role = 'STAFF'
              AND m.status = 'ACTIVE'
            GROUP BY m.id, u.full_name, u.email
            ORDER BY COUNT(t.id) FILTER (WHERE t.assigned_to_membership_id = m.id) DESC
            """, nativeQuery = true)
    List<Object[]> staff(
            @Param("businessId") UUID businessId,
            @Param("from") Instant from,
            @Param("to") Instant to
    );

    @Query(value = """
            SELECT
              COUNT(*),
              COUNT(*) FILTER (WHERE status = 'PENDING'),
              COUNT(*) FILTER (WHERE status = 'COMPLETED'),
              COUNT(*) FILTER (WHERE status = 'CANCELLED')
            FROM tasks
            WHERE business_id = :businessId
              AND assigned_to_membership_id = :membershipId
              AND deleted_at IS NULL
              AND created_at >= :from AND created_at < :to
            """, nativeQuery = true)
    List<Object[]> staffSummary(
            @Param("businessId") UUID businessId,
            @Param("membershipId") UUID membershipId,
            @Param("from") Instant from,
            @Param("to") Instant to
    );
}
