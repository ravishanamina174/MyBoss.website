package com.myboss.backend.modules.task.entity;

import com.myboss.backend.modules.task.enums.TaskStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "tasks")
public class TaskEntity {

    @Id
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "business_id", nullable = false)
    private UUID businessId;

    @Column(name = "created_by_membership_id", nullable = false)
    private UUID createdByMembershipId;

    @Column(name = "assigned_to_membership_id")
    private UUID assignedToMembershipId;

    @Column(name = "completed_by_membership_id")
    private UUID completedByMembershipId;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "description", columnDefinition = "text")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private TaskStatus status;

    @Column(name = "due_at")
    private Instant dueAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    @Column(name = "edited_at")
    private Instant editedAt;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected TaskEntity() {
    }

    public TaskEntity(
            UUID businessId,
            UUID createdByMembershipId,
            UUID assignedToMembershipId,
            String title,
            String description,
            Instant dueAt
    ) {
        this.businessId = businessId;
        this.createdByMembershipId = createdByMembershipId;
        this.assignedToMembershipId = assignedToMembershipId;
        this.title = title;
        this.description = description;
        this.dueAt = dueAt;
        this.status = TaskStatus.PENDING;
    }

    @PrePersist
    protected void onCreate() {
        if (id == null) {
            id = UUID.randomUUID();
        }

        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;

        if (status == null) {
            status = TaskStatus.PENDING;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public UUID getBusinessId() {
        return businessId;
    }

    public UUID getCreatedByMembershipId() {
        return createdByMembershipId;
    }

    public UUID getAssignedToMembershipId() {
        return assignedToMembershipId;
    }

    public UUID getCompletedByMembershipId() {
        return completedByMembershipId;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public TaskStatus getStatus() {
        return status;
    }

    public Instant getDueAt() {
        return dueAt;
    }

    public Instant getCompletedAt() {
        return completedAt;
    }

    public Instant getEditedAt() {
        return editedAt;
    }

    public Instant getDeletedAt() {
        return deletedAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void updateDetails(
            String title,
            String description,
            UUID assignedToMembershipId,
            Instant dueAt
    ) {
        this.title = title;
        this.description = description;
        this.assignedToMembershipId = assignedToMembershipId;
        this.dueAt = dueAt;
        this.editedAt = Instant.now();
    }

    public void complete(UUID completedByMembershipId) {
        if (status != TaskStatus.PENDING) {
            throw new IllegalStateException(
                    "Only pending tasks can be completed"
            );
        }

        this.status = TaskStatus.COMPLETED;
        this.completedByMembershipId = completedByMembershipId;
        this.completedAt = Instant.now();
    }

    public void cancel() {
        if (status == TaskStatus.COMPLETED) {
            throw new IllegalStateException(
                    "Completed tasks cannot be cancelled"
            );
        }

        this.status = TaskStatus.CANCELLED;
    }

    public void softDelete() {
        if (deletedAt == null) {
            deletedAt = Instant.now();
        }
    }
}