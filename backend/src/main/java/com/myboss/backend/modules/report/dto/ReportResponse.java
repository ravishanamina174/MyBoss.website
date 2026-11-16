package com.myboss.backend.modules.report.dto;

import java.time.LocalDate;
import java.util.List;

public record ReportResponse(
        long totalTasks,
        long pendingTasks,
        long completedTasks,
        long cancelledTasks,
        double completionRate,
        List<ActivityPoint> activity,
        List<StaffPerformance> staff
) {
    public record ActivityPoint(LocalDate date, long created, long completed) {}

    public record StaffPerformance(
            String membershipId,
            String name,
            String email,
            long assigned,
            long completed
    ) {}
}
