package com.myboss.backend.modules.business.service;

import com.myboss.backend.modules.business.dto.AcceptInvitationResponse;
import com.myboss.backend.modules.business.dto.CreateInvitationResponse;
import com.myboss.backend.modules.business.dto.InvitationResponse;
import com.myboss.backend.modules.business.entity.BusinessMembershipEntity;
import com.myboss.backend.modules.business.entity.StaffInvitationEntity;
import com.myboss.backend.modules.business.enums.BusinessRole;
import com.myboss.backend.modules.business.enums.InvitationStatus;
// import com.myboss.backend.modules.business.enums.MembershipStatus;
import com.myboss.backend.modules.business.repository.BusinessMembershipRepository;
import com.myboss.backend.modules.business.repository.StaffInvitationRepository;
import com.myboss.backend.modules.identity.entity.UserEntity;
import com.myboss.backend.modules.notification.service.NotificationService;
import com.myboss.backend.service.UserSyncService;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;

@Service
public class InvitationService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final StaffInvitationRepository invitationRepository;
    private final BusinessMembershipRepository membershipRepository;
    private final BusinessAuthorizationService authorizationService;
    private final UserSyncService userSyncService;
    private final String frontendUrl;
    private final NotificationService notificationService;

    public InvitationService(
            StaffInvitationRepository invitationRepository,
            BusinessMembershipRepository membershipRepository,
            BusinessAuthorizationService authorizationService,
            UserSyncService userSyncService,
            NotificationService notificationService,
            @Value("${app.frontend-url:http://localhost:3000}")
            String frontendUrl
    ) {
        this.invitationRepository = invitationRepository;
        this.membershipRepository = membershipRepository;
        this.authorizationService = authorizationService;
        this.userSyncService = userSyncService;
        this.notificationService = notificationService;
        this.frontendUrl = frontendUrl;
    }

    @Transactional
    public CreateInvitationResponse createInvitation(UUID businessId) {

        BusinessMembershipEntity owner =
                authorizationService.requireOwner(businessId);

        // Expire old invitations and revoke previous pending links.
        List<StaffInvitationEntity> existingInvitations =
                invitationRepository.findAllByBusinessIdAndStatus(
                        businessId,
                        InvitationStatus.PENDING
                );

        for (StaffInvitationEntity invitation : existingInvitations) {
            if (!invitation.getExpiresAt().isAfter(Instant.now())) {
                invitation.expire();
            } else {
                invitation.revoke();
            }
        }

        byte[] randomBytes = new byte[32];
        SECURE_RANDOM.nextBytes(randomBytes);

        String rawToken = Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(randomBytes);

        String tokenHash = hashToken(rawToken);

        Instant expiresAt = Instant.now().plus(24, ChronoUnit.HOURS);

        StaffInvitationEntity invitation =
                new StaffInvitationEntity(
                        businessId,
                        owner.getId(),
                        tokenHash,
                        expiresAt
                );

        invitationRepository.save(invitation);

        notificationService.create(
                businessId, owner.getUserId(), "INVITATION_CREATED",
                "Staff invitation created",
                "A new staff invitation link is ready to share.",
                "INVITATION_CREATED:" + invitation.getId(), null, invitation.getId());

        String invitationLink =
                frontendUrl.replaceAll("/+$", "")
                + "/staff-invitation/accept?token="
                + rawToken;

        return new CreateInvitationResponse(
                invitation.getId(),
                invitationLink,
                expiresAt
        );
    }

    @Transactional
public List<InvitationResponse> getInvitations(UUID businessId) {
    authorizationService.requireOwner(businessId);

    Instant now = Instant.now();

    List<StaffInvitationEntity> pending =
            invitationRepository.findAllByBusinessIdAndStatus(
                    businessId,
                    InvitationStatus.PENDING
            );

    for (StaffInvitationEntity invitation : pending) {
        if (!invitation.getExpiresAt().isAfter(now)) {
            invitation.expire();
            invitationRepository.save(invitation);
        }
    }

    return pending.stream()
            .filter(invitation ->
                    invitation.getStatus() == InvitationStatus.PENDING)
            .map(invitation -> new InvitationResponse(
                    invitation.getId(),
                    invitation.getStatus().name(),
                    invitation.getExpiresAt(),
                    invitation.getCreatedAt()
            ))
            .toList();
}

    @Transactional(noRollbackFor = ResponseStatusException.class)
    public void revokeInvitation(UUID businessId, UUID invitationId) {

        authorizationService.requireOwner(businessId);

        StaffInvitationEntity invitation =
                invitationRepository.findById(invitationId)
                        .orElseThrow(() -> new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Invitation not found"
                        ));

        if (!invitation.getBusinessId().equals(businessId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Invitation not found"
            );
        }

        if (invitation.getStatus() != InvitationStatus.PENDING) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Only pending invitations can be revoked"
            );
        }

        if (!invitation.getExpiresAt().isAfter(Instant.now())) {
            invitation.expire();
            invitationRepository.save(invitation);

            throw new ResponseStatusException(
                    HttpStatus.GONE,
                    "Invitation has expired"
            );
        }

        invitation.revoke();
        invitationRepository.save(invitation);
    }

    @Transactional(noRollbackFor = ResponseStatusException.class)
    public AcceptInvitationResponse acceptInvitation(String rawToken) {

        UserEntity user = userSyncService.syncCurrentUser();

        String tokenHash = hashToken(rawToken);

        StaffInvitationEntity invitation =
                invitationRepository.findByTokenHash(tokenHash)
                        .orElseThrow(() -> new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Invalid invitation"
                        ));

        if (invitation.getStatus() != InvitationStatus.PENDING) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Invitation is no longer available"
            );
        }

        if (!invitation.getExpiresAt().isAfter(Instant.now())) {
            invitation.expire();
            invitationRepository.save(invitation);

            throw new ResponseStatusException(
                    HttpStatus.GONE,
                    "Invitation has expired"
            );
        }

        UUID businessId = invitation.getBusinessId();

        if (membershipRepository.existsByBusinessIdAndUserId(
                businessId,
                user.getId()
        )) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "You already have a membership in this business"
            );
        }

        boolean alreadyStaff =
        membershipRepository.existsByUserIdAndRole(
                user.getId(),
                BusinessRole.STAFF
        );

        if (alreadyStaff) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "A staff member can only belong to one business"
            );
        }

        BusinessMembershipEntity membership =
                new BusinessMembershipEntity(
                        businessId,
                        user.getId(),
                        BusinessRole.STAFF
                );

        membership.awaitApproval();

        membershipRepository.save(membership);

        invitation.accept(membership.getId());

        invitationRepository.save(invitation);

        BusinessMembershipEntity owner = membershipRepository
                .findByBusinessIdAndRole(businessId, BusinessRole.OWNER)
                .orElse(null);
        if (owner != null) {
            notificationService.create(
                    businessId, owner.getUserId(), "INVITATION_ACCEPTED",
                    "Staff invitation accepted",
                    "A staff member is waiting for your approval.",
                    "INVITATION_ACCEPTED:" + invitation.getId(), null, invitation.getId());
        }

        return new AcceptInvitationResponse(
                businessId,
                membership.getId(),
                BusinessRole.STAFF.name(),
                "Your request is waiting for the business owner to approve it"
        );
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");

            byte[] hash = digest.digest(
                    token.getBytes(StandardCharsets.UTF_8)
            );

            return HexFormat.of().formatHex(hash);

        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException(
                    "SHA-256 algorithm is unavailable",
                    exception
            );
        }
    }
}
