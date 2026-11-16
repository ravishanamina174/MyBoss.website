package com.myboss.backend.modules.notification.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "notifications")
public class NotificationEntity {

    @Id
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "business_id", nullable = false)
    private UUID businessId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "type", nullable = false, length = 40)
    private String type;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "message", nullable = false, length = 500)
    private String message;

    @Column(name = "event_key", nullable = false, unique = true, length = 255)
    private String eventKey;

    @Column(name = "related_task_id")
    private UUID relatedTaskId;

    @Column(name = "related_invitation_id")
    private UUID relatedInvitationId;

    @Column(name = "read_at")
    private Instant readAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected NotificationEntity() {
    }

    public NotificationEntity(
            UUID businessId,
            UUID userId,
            String type,
            String title,
            String message,
            String eventKey,
            UUID relatedTaskId,
            UUID relatedInvitationId
    ) {
        this.businessId = businessId;
        this.userId = userId;
        this.type = type;
        this.title = title;
        this.message = message;
        this.eventKey = eventKey;
        this.relatedTaskId = relatedTaskId;
        this.relatedInvitationId = relatedInvitationId;
    }

    @PrePersist
    protected void onCreate() {
        if (id == null) {
            id = UUID.randomUUID();
        }
        createdAt = Instant.now();
    }

    public UUID getId() { return id; }
    public UUID getBusinessId() { return businessId; }
    public UUID getUserId() { return userId; }
    public String getType() { return type; }
    public String getTitle() { return title; }
    public String getMessage() { return message; }
    public String getEventKey() { return eventKey; }
    public UUID getRelatedTaskId() { return relatedTaskId; }
    public UUID getRelatedInvitationId() { return relatedInvitationId; }
    public Instant getReadAt() { return readAt; }
    public Instant getCreatedAt() { return createdAt; }

    public void markRead() {
        if (readAt == null) {
            readAt = Instant.now();
        }
    }
}
