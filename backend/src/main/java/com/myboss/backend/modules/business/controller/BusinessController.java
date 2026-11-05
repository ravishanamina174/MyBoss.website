package com.myboss.backend.modules.business.controller;

import com.myboss.backend.modules.business.dto.BusinessResponse;
import com.myboss.backend.modules.business.dto.RegisterBusinessRequest;
import com.myboss.backend.modules.business.dto.UpdateBusinessRequest;
import com.myboss.backend.modules.business.service.BusinessService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/businesses")
public class BusinessController {

    private final BusinessService businessService;

    public BusinessController(BusinessService businessService) {
        this.businessService = businessService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BusinessResponse registerBusiness(
            @Valid @RequestBody RegisterBusinessRequest request
    ) {
        return businessService.registerBusiness(request);
    }

    @GetMapping
    public List<BusinessResponse> getMyBusinesses() {
        return businessService.getMyBusinesses();
    }

    @GetMapping("/{businessId}")
    public BusinessResponse getBusiness(
            @PathVariable UUID businessId
    ) {
        return businessService.getBusiness(businessId);
    }

    @PatchMapping("/{businessId}")
    public BusinessResponse updateBusiness(
            @PathVariable UUID businessId,
            @Valid @RequestBody UpdateBusinessRequest request
    ) {
        return businessService.updateBusiness(businessId, request);
    }
}