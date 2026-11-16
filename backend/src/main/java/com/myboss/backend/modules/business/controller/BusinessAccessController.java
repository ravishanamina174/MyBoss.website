package com.myboss.backend.modules.business.controller;

import java.util.UUID;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.myboss.backend.modules.business.entity.BusinessMembershipEntity;
import com.myboss.backend.modules.business.service.BusinessAuthorizationService;

@RestController
@RequestMapping("/api/businesses/{businessId}/access")
public class BusinessAccessController {

    private final BusinessAuthorizationService authorizationService;

    public BusinessAccessController(
            BusinessAuthorizationService authorizationService) {
        this.authorizationService = authorizationService;
    }

    @GetMapping
    public AccessResponse checkAccess(@PathVariable UUID businessId) {
        BusinessMembershipEntity membership =
                authorizationService.requireActiveMembership(businessId);

        return new AccessResponse(
                true,
                businessId,
                membership.getRole().name(),
                membership.getStatus().name()
        );
    }

    @GetMapping("/owner-check")
    public AccessResponse checkOwnerAccess(@PathVariable UUID businessId) {
        BusinessMembershipEntity membership =
                authorizationService.requireOwner(businessId);

        return new AccessResponse(
                true,
                businessId,
                membership.getRole().name(),
                membership.getStatus().name()
        );
    }

    public record AccessResponse(
            boolean authorized,
            UUID businessId,
            String role,
            String status
    ) {}
}