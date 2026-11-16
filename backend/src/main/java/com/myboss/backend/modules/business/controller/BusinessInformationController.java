package com.myboss.backend.modules.business.controller;

import com.myboss.backend.modules.business.dto.BusinessInformationResponse;
import com.myboss.backend.modules.business.dto.UpdateBusinessCardRequest;
import com.myboss.backend.modules.business.dto.UpdateBusinessProfileRequest;
import com.myboss.backend.modules.business.service.BusinessInformationService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/businesses/{businessId}/information")
public class BusinessInformationController {
    private final BusinessInformationService businessInformationService;

    public BusinessInformationController(BusinessInformationService businessInformationService) {
        this.businessInformationService = businessInformationService;
    }

    @GetMapping
    public BusinessInformationResponse getInformation(@PathVariable UUID businessId) {
        return businessInformationService.getBusinessInformation(businessId);
    }

    @PutMapping("/profile")
    public BusinessInformationResponse updateProfile(
            @PathVariable UUID businessId,
            @Valid @RequestBody UpdateBusinessProfileRequest request
    ) {
        return businessInformationService.updateProfile(businessId, request);
    }

    @PutMapping("/card")
    public BusinessInformationResponse updateCard(
            @PathVariable UUID businessId,
            @Valid @RequestBody UpdateBusinessCardRequest request
    ) {
        return businessInformationService.updateCard(businessId, request);
    }

    @PatchMapping("/profile/published")
    public BusinessInformationResponse publishProfile(
            @PathVariable UUID businessId,
            @RequestParam boolean value
    ) {
        return businessInformationService.setProfilePublished(businessId, value);
    }

    @PatchMapping("/card/published")
    public BusinessInformationResponse publishCard(
            @PathVariable UUID businessId,
            @RequestParam boolean value
    ) {
        return businessInformationService.setCardPublished(businessId, value);
    }
}
