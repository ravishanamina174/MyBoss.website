package com.myboss.backend.modules.business.service;

import com.myboss.backend.modules.business.dto.StaffResponse;
import com.myboss.backend.modules.business.entity.BusinessMembershipEntity;
import com.myboss.backend.modules.business.enums.BusinessRole;
import com.myboss.backend.modules.business.enums.MembershipStatus;
import com.myboss.backend.modules.business.repository.BusinessMembershipRepository;
import com.myboss.backend.modules.identity.entity.UserEntity;
import com.myboss.backend.modules.identity.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class StaffService {

    private final BusinessMembershipRepository membershipRepository;
    private final UserRepository userRepository;
    private final BusinessAuthorizationService authorizationService;

    public StaffService(
            BusinessMembershipRepository membershipRepository,
            UserRepository userRepository,
            BusinessAuthorizationService authorizationService
    ) {
        this.membershipRepository = membershipRepository;
        this.userRepository = userRepository;
        this.authorizationService = authorizationService;
    }

    // GET ALL STAFF MEMBERS

    @Transactional(readOnly = true)
    public List<StaffResponse> getStaffMembers(UUID businessId) {

        authorizationService.requireOwner(businessId);

        List<BusinessMembershipEntity> memberships = new ArrayList<>();

        memberships.addAll(
                membershipRepository.findAllByBusinessIdAndStatus(
                        businessId,
                        MembershipStatus.PENDING
                )
        );

        memberships.addAll(
                membershipRepository.findAllByBusinessIdAndStatus(
                        businessId,
                        MembershipStatus.ACTIVE
                )
        );

        memberships.addAll(
                membershipRepository.findAllByBusinessIdAndStatus(
                        businessId,
                        MembershipStatus.SUSPENDED
                )
        );

        return memberships.stream()
                .filter(membership ->
                        membership.getRole() == BusinessRole.STAFF
                )
                .map(this::toResponse)
                .toList();
    }

    // GET SINGLE STAFF MEMBER

    @Transactional(readOnly = true)
    public StaffResponse getStaffMember(
            UUID businessId,
            UUID membershipId
    ) {
        authorizationService.requireOwner(businessId);

        BusinessMembershipEntity membership =
                getStaffMembership(businessId, membershipId);

        return toResponse(membership);
    }

    // SUSPEND STAFF MEMBER

    @Transactional
    public StaffResponse suspendStaffMember(
            UUID businessId,
            UUID membershipId
    ) {
        authorizationService.requireOwner(businessId);

        BusinessMembershipEntity membership =
                getStaffMembership(businessId, membershipId);

        if (membership.getStatus() != MembershipStatus.ACTIVE) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Only active staff members can be suspended"
            );
        }

        membership.suspend();

        membershipRepository.save(membership);

        return toResponse(membership);
    }

    // REACTIVATE STAFF MEMBER

    @Transactional
    public StaffResponse activateStaffMember(
            UUID businessId,
            UUID membershipId
    ) {
        authorizationService.requireOwner(businessId);

        BusinessMembershipEntity membership =
                getStaffMembership(businessId, membershipId);

        if (membership.getStatus() == MembershipStatus.ACTIVE) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Staff member is already active"
            );
        }

        membership.activate();

        membershipRepository.save(membership);

        return toResponse(membership);
    }

    // FIND AND VALIDATE STAFF MEMBERSHIP

    private BusinessMembershipEntity getStaffMembership(
            UUID businessId,
            UUID membershipId
    ) {
        BusinessMembershipEntity membership =
                membershipRepository.findById(membershipId)
                        .orElseThrow(() -> new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Staff membership not found"
                        ));

        if (!membership.getBusinessId().equals(businessId)
                || membership.getRole() != BusinessRole.STAFF) {

            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Staff membership not found"
            );
        }

        return membership;
    }

    // ENTITY TO RESPONSE DTO

    private StaffResponse toResponse(
            BusinessMembershipEntity membership
    ) {
        UserEntity user = userRepository.findById(membership.getUserId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Staff user profile not found"
                ));

        return new StaffResponse(
                membership.getId(),
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                membership.getRole().name(),
                membership.getStatus().name(),
                membership.getCreatedAt()
        );
    }
}
