package com.myboss.backend.modules.business.controller;

import com.myboss.backend.modules.business.dto.AcceptInvitationRequest;
import com.myboss.backend.modules.business.dto.AcceptInvitationResponse;
import com.myboss.backend.modules.business.dto.CreateInvitationResponse;
import com.myboss.backend.modules.business.dto.InvitationResponse;
import com.myboss.backend.modules.business.service.InvitationService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
public class InvitationController {

    private final InvitationService invitationService;

    public InvitationController(InvitationService invitationService) {
        this.invitationService = invitationService;
    }

    @PostMapping("/api/businesses/{businessId}/invitations")
    @ResponseStatus(HttpStatus.CREATED)
    public CreateInvitationResponse createInvitation(
            @PathVariable UUID businessId
    ) {
        return invitationService.createInvitation(businessId);
    }

    @GetMapping("/api/businesses/{businessId}/invitations")
    public List<InvitationResponse> getInvitations(
            @PathVariable UUID businessId
    ) {
        return invitationService.getInvitations(businessId);
    }

    @PostMapping(
            "/api/businesses/{businessId}/invitations/{invitationId}/revoke"
    )
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void revokeInvitation(
            @PathVariable UUID businessId,
            @PathVariable UUID invitationId
    ) {
        invitationService.revokeInvitation(businessId, invitationId);
    }

    @PostMapping("/api/invitations/accept")
    public AcceptInvitationResponse acceptInvitation(
            @Valid @RequestBody AcceptInvitationRequest request
    ) {
        return invitationService.acceptInvitation(request.token());
    }
}