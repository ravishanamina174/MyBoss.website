package com.myboss.backend.modules.business.entity;

import com.myboss.backend.modules.business.enums.BusinessRole;
import com.myboss.backend.modules.business.enums.MembershipStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "business_memberships")
public class BusinessMembershipEntity {

    @Id
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "business_id", nullable = false)
    private UUID businessId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 20)
    private BusinessRole role;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private MembershipStatus status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected BusinessMembershipEntity() {
    }

    public BusinessMembershipEntity(
            UUID businessId,
            UUID userId,
            BusinessRole role
    ) {
        this.businessId = businessId;
        this.userId = userId;
        this.role = role;
        this.status = MembershipStatus.ACTIVE;
    }

    @PrePersist
    protected void onCreate() {
        if (id == null) {
            id = UUID.randomUUID();
        }

        createdAt = Instant.now();

        if (status == null) {
            status = MembershipStatus.ACTIVE;
        }
    }

    public UUID getId() {
        return id;
    }

    public UUID getBusinessId() {
        return businessId;
    }

    public UUID getUserId() {
        return userId;
    }

    public BusinessRole getRole() {
        return role;
    }

    public MembershipStatus getStatus() {
        return status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void suspend() {
        status = MembershipStatus.SUSPENDED;
    }

    public void activate() {
        status = MembershipStatus.ACTIVE;
    }

    public void awaitApproval() {
        status = MembershipStatus.PENDING;
    }
}
