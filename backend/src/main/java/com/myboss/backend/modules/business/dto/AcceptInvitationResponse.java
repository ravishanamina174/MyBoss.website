package com.myboss.backend.modules.business.dto;

import java.util.UUID;

public record AcceptInvitationResponse(
        UUID businessId,
        UUID membershipId,
        String role,
        String message
) {}