package com.myboss.backend.modules.business.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public record UpdateBusinessProfileRequest(
        @NotBlank(message = "Business name is required")
        @Size(max = 150, message = "Business name cannot exceed 150 characters")
        String name,
        @Size(max = 4000, message = "Business description cannot exceed 4000 characters")
        String description,
        @Email(message = "Contact email must be valid")
        @Size(max = 320, message = "Contact email cannot exceed 320 characters")
        String contactEmail,
        @Size(max = 50, message = "Phone number cannot exceed 50 characters")
        String phoneNumber,
        @Size(max = 200, message = "Address cannot exceed 200 characters")
        String addressLine1,
        @Size(max = 200, message = "Address cannot exceed 200 characters")
        String addressLine2,
        @Size(max = 100, message = "City cannot exceed 100 characters")
        String city,
        @Size(max = 100, message = "Region cannot exceed 100 characters")
        String region,
        @Size(max = 30, message = "Postal code cannot exceed 30 characters")
        String postalCode,
        @Size(max = 100, message = "Country cannot exceed 100 characters")
        String country,
        @Size(max = 500, message = "Website URL cannot exceed 500 characters")
        String websiteUrl,
        @Size(max = 500, message = "Facebook URL cannot exceed 500 characters")
        String facebookUrl,
        @Size(max = 500, message = "Instagram URL cannot exceed 500 characters")
        String instagramUrl,
        @Size(max = 500, message = "LinkedIn URL cannot exceed 500 characters")
        String linkedinUrl,
        @Size(max = 1000, message = "Profile image URL cannot exceed 1000 characters")
        String profileImageUrl,
        @Size(max = 1000, message = "Cover image URL cannot exceed 1000 characters")
        String coverImageUrl,
        @Valid
        @Size(max = 8, message = "You can add up to 8 gallery images")
        List<@NotBlank @Size(max = 1000) String> galleryUrls
) {}
