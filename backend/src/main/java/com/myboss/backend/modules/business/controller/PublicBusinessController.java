package com.myboss.backend.modules.business.controller;

import com.myboss.backend.modules.business.dto.PublicBusinessResponse;
import com.myboss.backend.modules.business.dto.PublicCardResponse;
import com.myboss.backend.modules.business.service.BusinessInformationService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public")
public class PublicBusinessController {
    private final BusinessInformationService businessInformationService;

    public PublicBusinessController(BusinessInformationService businessInformationService) {
        this.businessInformationService = businessInformationService;
    }

    @GetMapping("/businesses/{publicIdentifier}")
    public PublicBusinessResponse getBusiness(@PathVariable String publicIdentifier) {
        return businessInformationService.getPublicBusiness(publicIdentifier);
    }

    @GetMapping("/cards/{publicIdentifier}")
    public PublicCardResponse getCard(@PathVariable String publicIdentifier) {
        return businessInformationService.getPublicCard(publicIdentifier);
    }
}
