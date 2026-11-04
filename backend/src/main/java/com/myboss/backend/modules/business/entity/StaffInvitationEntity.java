package com.myboss.backend.modules.business.entity;

import com.myboss.backend.modules.business.enums.InvitationStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "staff_invitations")
public class StaffInvitationEntity {

    @Id
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "business_id", nullable = false)
    private UUID businessId;

    @Column(name = "created_by_membership_id", nullable = false)
    private UUID createdByMembershipId;

    @Column(name = "accepted_by_membership_id")
    private UUID acceptedByMembershipId;

    @JdbcTypeCode(SqlTypes.CHAR)
    @Column(name = "token_hash", length = 64, nullable = false)
    private String tokenHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private InvitationStatus status;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "accepted_at")
    private Instant acceptedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected StaffInvitationEntity() {
    }

    public StaffInvitationEntity(
            UUID businessId,
            UUID createdByMembershipId,
            String tokenHash,
            Instant expiresAt
    ) {
        this.businessId = businessId;
        this.createdByMembershipId = createdByMembershipId;
        this.tokenHash = tokenHash;
        this.expiresAt = expiresAt;
        this.status = InvitationStatus.PENDING;
    }

    @PrePersist
    protected void onCreate() {
        if (id == null) {
            id = UUID.randomUUID();
        }

        createdAt = Instant.now();

        if (status == null) {
            status = InvitationStatus.PENDING;
        }
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

    public UUID getAcceptedByMembershipId() {
        return acceptedByMembershipId;
    }

    public String getTokenHash() {
        return tokenHash;
    }

    public InvitationStatus getStatus() {
        return status;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public Instant getAcceptedAt() {
        return acceptedAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void accept(UUID membershipId) {
        if (status != InvitationStatus.PENDING) {
            throw new IllegalStateException("Invitation is not pending");
        }

        if (!expiresAt.isAfter(Instant.now())) {
            status = InvitationStatus.EXPIRED;
            throw new IllegalStateException("Invitation has expired");
        }

        status = InvitationStatus.ACCEPTED;
        acceptedByMembershipId = membershipId;
        acceptedAt = Instant.now();
    }

    public void revoke() {
        if (status == InvitationStatus.PENDING) {
            status = InvitationStatus.REVOKED;
        }
    }

    public void expire() {
        if (status == InvitationStatus.PENDING
                && !expiresAt.isAfter(Instant.now())) {
            status = InvitationStatus.EXPIRED;
        }
    }
}