package com.myboss.backend.modules.report.controller;

import com.myboss.backend.modules.report.dto.ReportResponse;
import com.myboss.backend.modules.report.service.ReportService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.UUID;

@RestController
@RequestMapping("/api/businesses/{businessId}/reports")
public class ReportController {
    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping
    public ReportResponse getReport(
            @org.springframework.web.bind.annotation.PathVariable UUID businessId,
            @RequestParam Instant from,
            @RequestParam Instant to
    ) {
        return reportService.getReport(businessId, from, to);
    }
}
