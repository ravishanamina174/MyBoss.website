package com.myboss.backend.modules.notification.service;

import com.myboss.backend.modules.business.entity.BusinessMembershipEntity;
import com.myboss.backend.modules.business.service.BusinessAuthorizationService;
import com.myboss.backend.modules.notification.dto.NotificationResponse;
import com.myboss.backend.modules.notification.entity.NotificationEntity;
import com.myboss.backend.modules.notification.repository.NotificationRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@Service
public class NotificationService {
    private final NotificationRepository repository;
    private final BusinessAuthorizationService authorizationService;

    public NotificationService(
            NotificationRepository repository,
            BusinessAuthorizationService authorizationService
    ) {
        this.repository = repository;
        this.authorizationService = authorizationService;
    }

    @Transactional(readOnly = true)
    public Page<NotificationResponse> getNotifications(UUID businessId, int page, int size) {
        BusinessMembershipEntity membership =
                authorizationService.requireActiveMembership(businessId);
        int boundedSize = Math.min(Math.max(size, 1), 50);
        return repository.findAllByUserIdAndBusinessIdOrderByCreatedAtDesc(
                        membership.getUserId(), businessId,
                        PageRequest.of(Math.max(page, 0), boundedSize,
                                Sort.by(Sort.Direction.DESC, "createdAt")))
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public long unreadCount(UUID businessId) {
        BusinessMembershipEntity membership =
                authorizationService.requireActiveMembership(businessId);
        return repository.countByUserIdAndBusinessIdAndReadAtIsNull(
                membership.getUserId(), businessId);
    }

    @Transactional
    public void markRead(UUID businessId, UUID notificationId) {
        BusinessMembershipEntity membership =
                authorizationService.requireActiveMembership(businessId);
        NotificationEntity notification = repository.findById(notificationId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Notification not found"));
        if (!notification.getBusinessId().equals(businessId)
                || !notification.getUserId().equals(membership.getUserId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found");
        }
        notification.markRead();
    }

    @Transactional
    public void markAllRead(UUID businessId) {
        BusinessMembershipEntity membership =
                authorizationService.requireActiveMembership(businessId);
        repository.markAllByUserIdAndBusinessIdAndReadAtIsNull(
                membership.getUserId(), businessId);
    }

    @Transactional
    public void create(
            UUID businessId,
            UUID userId,
            String type,
            String title,
            String message,
            String eventKey,
            UUID taskId,
            UUID invitationId
    ) {
        if (!repository.existsByEventKey(eventKey)) {
            repository.save(new NotificationEntity(
                    businessId, userId, type, title, message, eventKey,
                    taskId, invitationId));
        }
    }

    private NotificationResponse toResponse(NotificationEntity notification) {
        return new NotificationResponse(
                notification.getId(), notification.getBusinessId(),
                notification.getType(), notification.getTitle(),
                notification.getMessage(), notification.getRelatedTaskId(),
                notification.getRelatedInvitationId(),
                notification.getReadAt() != null, notification.getCreatedAt());
    }
}
