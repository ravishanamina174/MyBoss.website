
package com.myboss.backend.modules.business.service;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.myboss.backend.modules.business.entity.BusinessMembershipEntity;
import com.myboss.backend.modules.business.enums.BusinessRole;
import com.myboss.backend.modules.business.enums.MembershipStatus;
import com.myboss.backend.modules.business.repository.BusinessMembershipRepository;
import com.myboss.backend.modules.identity.entity.UserEntity;
import com.myboss.backend.modules.identity.repository.UserRepository;
import com.myboss.backend.security.CurrentUserService;

@Service
public class BusinessAuthorizationService {

    private final CurrentUserService currentUserService;
    private final UserRepository userRepository;
    private final BusinessMembershipRepository membershipRepository;

    public BusinessAuthorizationService(
            CurrentUserService currentUserService,
            UserRepository userRepository,
            BusinessMembershipRepository membershipRepository) {

        this.currentUserService = currentUserService;
        this.userRepository = userRepository;
        this.membershipRepository = membershipRepository;
    }

    @Transactional(readOnly = true)
    public UserEntity getCurrentUser() {

        String clerkUserId =
            currentUserService.getCurrentClerkUserId();

        return userRepository.findByClerkUserId(clerkUserId)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "MyBoss user not found"
            ));
    }

    @Transactional(readOnly = true)
    public BusinessMembershipEntity requireActiveMembership(
            UUID businessId) {

        UserEntity user = getCurrentUser();

        return membershipRepository
            .findByBusinessIdAndUserIdAndStatus(
                businessId,
                user.getId(),
                MembershipStatus.ACTIVE
            )
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "You do not have active access to this business"
            ));
    }

    @Transactional(readOnly = true)
    public BusinessMembershipEntity requireOwner(UUID businessId) {

        BusinessMembershipEntity membership =
            requireActiveMembership(businessId);

        if (membership.getRole() != BusinessRole.OWNER) {
            throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "Owner permission required"
            );
        }

        return membership;
    }

    @Transactional(readOnly = true)
    public BusinessMembershipEntity requireStaffOrOwner(
            UUID businessId) {

        BusinessMembershipEntity membership =
            requireActiveMembership(businessId);

        if (membership.getRole() != BusinessRole.STAFF
                && membership.getRole() != BusinessRole.OWNER) {

            throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "Business membership required"
            );
        }

        return membership;
    }

    @Transactional(readOnly = true)
    public boolean hasActiveMembership(UUID businessId) {

        UserEntity user = getCurrentUser();

        return membershipRepository
            .findByBusinessIdAndUserIdAndStatus(
                businessId,
                user.getId(),
                MembershipStatus.ACTIVE
            )
            .isPresent();
    }

    @Transactional(readOnly = true)
    public boolean isOwner(UUID businessId) {

        return hasActiveMembership(businessId)
            && membershipRepository
                .findByBusinessIdAndUserIdAndStatus(
                    businessId,
                    getCurrentUser().getId(),
                    MembershipStatus.ACTIVE
                )
                .map(membership ->
                    membership.getRole() == BusinessRole.OWNER
                )
                .orElse(false);
    }
}
