package com.myboss.backend.modules.business.controller;

import com.myboss.backend.modules.business.dto.StaffResponse;
import com.myboss.backend.modules.business.service.StaffService;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/businesses/{businessId}/staff")
public class StaffController {

    private final StaffService staffService;

    public StaffController(StaffService staffService) {
        this.staffService = staffService;
    }

    // GET ALL STAFF

    @GetMapping
    public List<StaffResponse> getStaffMembers(
            @PathVariable UUID businessId
    ) {
        return staffService.getStaffMembers(businessId);
    }

    // GET SINGLE STAFF MEMBER

    @GetMapping("/{membershipId}")
    public StaffResponse getStaffMember(
            @PathVariable UUID businessId,
            @PathVariable UUID membershipId
    ) {
        return staffService.getStaffMember(
                businessId,
                membershipId
        );
    }

    // SUSPEND STAFF

    @PatchMapping("/{membershipId}/suspend")
    public StaffResponse suspendStaffMember(
            @PathVariable UUID businessId,
            @PathVariable UUID membershipId
    ) {
        return staffService.suspendStaffMember(
                businessId,
                membershipId
        );
    }

    // ACTIVATE STAFF

    @PatchMapping("/{membershipId}/activate")
    public StaffResponse activateStaffMember(
            @PathVariable UUID businessId,
            @PathVariable UUID membershipId
    ) {
        return staffService.activateStaffMember(
                businessId,
                membershipId
        );
    }
}