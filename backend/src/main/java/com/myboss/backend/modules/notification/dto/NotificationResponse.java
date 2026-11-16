package com.myboss.backend.modules.notification.dto;

import java.time.Instant;
import java.util.UUID;

public record NotificationResponse(
        UUID id,
        UUID businessId,
        String type,
        String title,
        String message,
        UUID relatedTaskId,
        UUID relatedInvitationId,
        boolean read,
        Instant createdAt
) {}
