package com.myboss.backend.modules.notification.repository;

import com.myboss.backend.modules.notification.entity.NotificationEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;

import java.util.UUID;

public interface NotificationRepository extends JpaRepository<NotificationEntity, UUID> {
    Page<NotificationEntity> findAllByUserIdAndBusinessIdOrderByCreatedAtDesc(
            UUID userId, UUID businessId, Pageable pageable);

    long countByUserIdAndBusinessIdAndReadAtIsNull(UUID userId, UUID businessId);

    boolean existsByEventKey(String eventKey);

    @Modifying
    @org.springframework.data.jpa.repository.Query("""
            UPDATE NotificationEntity n SET n.readAt = CURRENT_TIMESTAMP
            WHERE n.userId = :userId AND n.businessId = :businessId AND n.readAt IS NULL
            """)
    long markAllByUserIdAndBusinessIdAndReadAtIsNull(
            @org.springframework.data.repository.query.Param("userId") UUID userId,
            @org.springframework.data.repository.query.Param("businessId") UUID businessId);
}
