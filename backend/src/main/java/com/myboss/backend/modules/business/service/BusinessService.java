package com.myboss.backend.modules.business.service;

import com.myboss.backend.modules.business.dto.BusinessResponse;
import com.myboss.backend.modules.business.dto.RegisterBusinessRequest;
import com.myboss.backend.modules.business.dto.UpdateBusinessRequest;
import com.myboss.backend.modules.business.entity.BusinessEntity;
import com.myboss.backend.modules.business.entity.BusinessMembershipEntity;
import com.myboss.backend.modules.business.enums.BusinessRole;
import com.myboss.backend.modules.business.enums.MembershipStatus;
import com.myboss.backend.modules.business.repository.BusinessMembershipRepository;
import com.myboss.backend.modules.business.repository.BusinessRepository;
import com.myboss.backend.modules.identity.entity.UserEntity;
import com.myboss.backend.service.UserSyncService;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class BusinessService {

    private final BusinessRepository businessRepository;
    private final BusinessMembershipRepository membershipRepository;
    private final BusinessAuthorizationService authorizationService;
    private final UserSyncService userSyncService;

    public BusinessService(
            BusinessRepository businessRepository,
            BusinessMembershipRepository membershipRepository,
            BusinessAuthorizationService authorizationService,
            UserSyncService userSyncService
    ) {
        this.businessRepository = businessRepository;
        this.membershipRepository = membershipRepository;
        this.authorizationService = authorizationService;
        this.userSyncService = userSyncService;
    }

    @Transactional
    public BusinessResponse registerBusiness(RegisterBusinessRequest request) {

        UserEntity user = userSyncService.syncCurrentUser();

        BusinessEntity business =
                businessRepository.save(new BusinessEntity(request.name().trim()));

        BusinessMembershipEntity membership =
                new BusinessMembershipEntity(
                        business.getId(),
                        user.getId(),
                        BusinessRole.OWNER
                );

        membershipRepository.save(membership);

        return toResponse(business, membership);
    }

    @Transactional(readOnly = true)
    public List<BusinessResponse> getMyBusinesses() {

        UserEntity user = authorizationService.getCurrentUser();

        List<BusinessMembershipEntity> memberships =
                membershipRepository.findAllByUserIdAndStatus(
                        user.getId(),
                        MembershipStatus.ACTIVE
                );

        return memberships.stream()
                .map(membership -> {
                    BusinessEntity business = businessRepository
                            .findById(membership.getBusinessId())
                            .orElseThrow(() -> new ResponseStatusException(
                                    HttpStatus.NOT_FOUND,
                                    "Business not found"
                            ));

                    return toResponse(business, membership);
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public BusinessResponse getBusiness(UUID businessId) {

        BusinessMembershipEntity membership =
                authorizationService.requireActiveMembership(businessId);

        BusinessEntity business = getBusinessOrThrow(businessId);

        return toResponse(business, membership);
    }

    @Transactional
    public BusinessResponse updateBusiness(
            UUID businessId,
            UpdateBusinessRequest request
    ) {
        authorizationService.requireOwner(businessId);

        BusinessEntity business = getBusinessOrThrow(businessId);

        business.updateName(request.name().trim());

        businessRepository.save(business);

        BusinessMembershipEntity membership =
                authorizationService.requireActiveMembership(businessId);

        return toResponse(business, membership);
    }

    private BusinessEntity getBusinessOrThrow(UUID businessId) {
        return businessRepository.findById(businessId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Business not found"
                ));
    }

    private BusinessResponse toResponse(
            BusinessEntity business,
            BusinessMembershipEntity membership
    ) {
        return new BusinessResponse(
                business.getId(),
                business.getName(),
                membership.getRole().name(),
                membership.getStatus().name(),
                membership.getId(),
                membership.getUserId(),
                authorizationService.getCurrentUser().getEmail(),
                authorizationService.getCurrentUser().getFullName(),
                membership.getCreatedAt(),
                business.getCreatedAt()
        );
    }
}