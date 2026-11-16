package com.myboss.backend.modules.business.dto;

import java.time.Instant;
import java.util.UUID;

public record BusinessResponse(
        UUID id,
        String name,
        String role,
        String status,
        UUID membershipId,
        UUID userId,
        String userEmail,
        String userFullName,
        Instant membershipCreatedAt,
        Instant createdAt
) {}