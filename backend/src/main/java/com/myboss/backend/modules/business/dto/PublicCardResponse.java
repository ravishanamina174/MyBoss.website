package com.myboss.backend.modules.business.dto;

public record PublicCardResponse(
        String publicIdentifier,
        String businessName,
        String description,
        String contactName,
        String contactEmail,
        String phoneNumber,
        String websiteUrl,
        String logoUrl,
        String facebookUrl,
        String instagramUrl,
        String linkedinUrl
) {}
