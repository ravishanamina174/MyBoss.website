package com.myboss.backend.modules.business.dto;

import java.time.Instant;
import java.util.UUID;

public record InvitationResponse(
        UUID id,
        String status,
        Instant expiresAt,
        Instant createdAt
) {}