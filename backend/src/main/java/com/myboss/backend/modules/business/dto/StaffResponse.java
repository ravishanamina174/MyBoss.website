package com.myboss.backend.modules.business.dto;

import java.time.Instant;
import java.util.UUID;

public record StaffResponse(
        UUID membershipId,
        UUID userId,
        String fullName,
        String email,
        String role,
        String status,
        Instant joinedAt
) {}