package com.myboss.backend.modules.business.service;

import com.myboss.backend.modules.business.entity.BusinessMembershipEntity;
import com.myboss.backend.modules.business.enums.BusinessRole;
import com.myboss.backend.modules.business.enums.MembershipStatus;
import com.myboss.backend.modules.business.repository.BusinessMembershipRepository;
import com.myboss.backend.modules.identity.entity.UserEntity;
import com.myboss.backend.modules.identity.repository.UserRepository;
import com.myboss.backend.security.CurrentUserService;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@Service
public class BusinessAuthorizationService {

    private final CurrentUserService currentUserService;
    private final UserRepository userRepository;
    private final BusinessMembershipRepository membershipRepository;

    public BusinessAuthorizationService(
            CurrentUserService currentUserService,
            UserRepository userRepository,
            BusinessMembershipRepository membershipRepository
    ) {
        this.currentUserService = currentUserService;
        this.userRepository = userRepository;
        this.membershipRepository = membershipRepository;
    }

    public UserEntity getCurrentUser() {
        String clerkUserId = currentUserService.getCurrentClerkUserId();

        return userRepository.findByClerkUserId(clerkUserId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "User profile not found"
                ));
    }

    public BusinessMembershipEntity requireActiveMembership(UUID businessId) {
        UserEntity user = getCurrentUser();

        return membershipRepository
                .findByBusinessIdAndUserIdAndStatus(
                        businessId,
                        user.getId(),
                        MembershipStatus.ACTIVE
                )
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "You do not have access to this business"
                ));
    }

    public BusinessMembershipEntity requireOwner(UUID businessId) {
        BusinessMembershipEntity membership =
                requireActiveMembership(businessId);

        if (membership.getRole() != BusinessRole.OWNER) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only the business owner can perform this action"
            );
        }

        return membership;
    }
}