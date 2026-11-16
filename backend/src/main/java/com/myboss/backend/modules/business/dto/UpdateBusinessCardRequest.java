package com.myboss.backend.modules.business.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public record UpdateBusinessCardRequest(
        @Size(max = 500, message = "Card description cannot exceed 500 characters")
        String description,
        @Size(max = 150, message = "Contact name cannot exceed 150 characters")
        String contactName,
        @Email(message = "Card email must be valid")
        @Size(max = 320, message = "Card email cannot exceed 320 characters")
        String contactEmail,
        @Size(max = 50, message = "Card phone number cannot exceed 50 characters")
        String phoneNumber,
        @Size(max = 500, message = "Card website URL cannot exceed 500 characters")
        String websiteUrl,
        @Size(max = 1000, message = "Card logo URL cannot exceed 1000 characters")
        String logoUrl
) {}
