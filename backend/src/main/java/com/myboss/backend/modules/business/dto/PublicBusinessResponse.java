package com.myboss.backend.modules.business.dto;

import java.util.List;

public record PublicBusinessResponse(
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
        List<String> galleryUrls
) {}
