package com.myboss.backend.modules.business.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record BusinessInformationResponse(
        UUID businessId,
        String publicIdentifier,
        String name,
        String description,
        String contactEmail,
        String phoneNumber,
        String addressLine1,
        String addressLine2,
        String city,
        String region,
        String postalCode,
        String country,
        String websiteUrl,
        String facebookUrl,
        String instagramUrl,
        String linkedinUrl,
        String profileImageUrl,
        String coverImageUrl,
        List<String> galleryUrls,
        boolean profilePublished,
        CardInformation card,
        Instant updatedAt
) {
    public record CardInformation(
            String description,
            String contactName,
            String contactEmail,
            String phoneNumber,
            String websiteUrl,
            String logoUrl,
            boolean published
    ) {}
}
