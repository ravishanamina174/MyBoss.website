package com.myboss.backend.modules.task.dto;

import java.time.Instant;
import java.util.UUID;

public record TaskResponse(

        UUID id,

        UUID businessId,

        UUID createdByMembershipId,

        UUID assignedToMembershipId,

        UUID completedByMembershipId,

        String title,

        String description,

        String status,

        Instant dueAt,

        Instant completedAt,

        Instant editedAt,

        Instant createdAt,

        Instant updatedAt
) {}