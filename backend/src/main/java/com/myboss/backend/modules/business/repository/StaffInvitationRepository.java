package com.myboss.backend.modules.business.repository;

import com.myboss.backend.modules.business.entity.StaffInvitationEntity;
import com.myboss.backend.modules.business.enums.InvitationStatus;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface StaffInvitationRepository
        extends JpaRepository<StaffInvitationEntity, UUID> {

    Optional<StaffInvitationEntity> findByTokenHash(String tokenHash);

    Optional<StaffInvitationEntity>
    findFirstByBusinessIdAndStatusOrderByCreatedAtDesc(
            UUID businessId,
            InvitationStatus status
    );

    List<StaffInvitationEntity> findAllByBusinessIdAndStatus(
            UUID businessId,
            InvitationStatus status
    );

    boolean existsByBusinessIdAndStatus(
            UUID businessId,
            InvitationStatus status
    );
}