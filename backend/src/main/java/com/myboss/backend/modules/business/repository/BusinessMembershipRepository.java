package com.myboss.backend.modules.business.repository;

import com.myboss.backend.modules.business.entity.BusinessMembershipEntity;
import com.myboss.backend.modules.business.enums.BusinessRole;
import com.myboss.backend.modules.business.enums.MembershipStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BusinessMembershipRepository
        extends JpaRepository<BusinessMembershipEntity, UUID> {

    Optional<BusinessMembershipEntity> findByBusinessIdAndUserId(
            UUID businessId,
            UUID userId
    );

    Optional<BusinessMembershipEntity> findByBusinessIdAndUserIdAndStatus(
            UUID businessId,
            UUID userId,
            MembershipStatus status
    );

    List<BusinessMembershipEntity> findAllByUserIdAndStatus(
            UUID userId,
            MembershipStatus status
    );

    List<BusinessMembershipEntity> findAllByBusinessIdAndStatus(
            UUID businessId,
            MembershipStatus status
    );

    Optional<BusinessMembershipEntity> findByBusinessIdAndRole(
            UUID businessId,
            BusinessRole role
    );

    boolean existsByBusinessIdAndUserId(
            UUID businessId,
            UUID userId
    );
}