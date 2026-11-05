package com.myboss.backend.modules.business.dto;

import java.time.Instant;
import java.util.UUID;

public record CreateInvitationResponse(
        UUID invitationId,
        String invitationLink,
        Instant expiresAt
) {}