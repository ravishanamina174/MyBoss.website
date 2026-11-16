
package com.myboss.backend.modules.report.service;

import com.myboss.backend.modules.business.entity.BusinessMembershipEntity;
import com.myboss.backend.modules.business.enums.BusinessRole;
import com.myboss.backend.modules.business.service.BusinessAuthorizationService;
import com.myboss.backend.modules.identity.repository.UserRepository;
import com.myboss.backend.modules.report.dto.ReportResponse;
import com.myboss.backend.modules.report.repository.ReportRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Date;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class ReportService {

    private final ReportRepository reportRepository;
    private final BusinessAuthorizationService authorizationService;
    private final UserRepository userRepository;

    public ReportService(
            ReportRepository reportRepository,
            BusinessAuthorizationService authorizationService,
            UserRepository userRepository
    ) {
        this.reportRepository = reportRepository;
        this.authorizationService = authorizationService;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public ReportResponse getReport(UUID businessId, Instant from, Instant to) {

        BusinessMembershipEntity membership =
                authorizationService.requireActiveMembership(businessId);

        if (from == null || to == null || !to.isAfter(from)) {
            throw new IllegalArgumentException(
                    "Report end date must be after start date"
            );
        }

        boolean isOwner = membership.getRole() == BusinessRole.OWNER;

        List<Object[]> summaryRows = isOwner
                ? reportRepository.summary(businessId, from, to)
                : reportRepository.staffSummary(
                        businessId, membership.getId(), from, to
                );

        Object[] summary = summaryRows.isEmpty()
                ? new Object[]{0L, 0L, 0L, 0L}
                : summaryRows.get(0);

        long total = number(summary[0]);
        long pending = number(summary[1]);
        long completed = number(summary[2]);
        long cancelled = number(summary[3]);

        List<ReportResponse.ActivityPoint> activity = isOwner
                ? reportRepository.activity(businessId, from, to).stream()
                    .map(row -> new ReportResponse.ActivityPoint(
                            toLocalDate(row[0]),
                            number(row[1]),
                            number(row[2])
                    ))
                    .toList()
                : List.of();

        List<ReportResponse.StaffPerformance> staff = isOwner
                ? reportRepository.staff(businessId, from, to).stream()
                    .map(row -> new ReportResponse.StaffPerformance(
                            row[0].toString(),
                            row[1] == null
                                    ? "Unnamed staff member"
                                    : row[1].toString(),
                            row[2].toString(),
                            number(row[3]),
                            number(row[4])
                    ))
                    .toList()
                : List.of(new ReportResponse.StaffPerformance(
                        membership.getId().toString(),
                        userRepository.findById(membership.getUserId())
                                .map(user -> user.getFullName() == null
                                        ? user.getEmail()
                                        : user.getFullName())
                                .orElse("You"),
                        userRepository.findById(membership.getUserId())
                                .map(user -> user.getEmail())
                                .orElse(""),
                        total,
                        completed
                ));

        double completionRate = total - cancelled <= 0
                ? 0
                : completed * 100.0 / (total - cancelled);

        return new ReportResponse(
                total,
                pending,
                completed,
                cancelled,
                completionRate,
                activity,
                staff
        );
    }

    private long number(Object value) {
        if (value == null) {
            return 0;
        }

        if (value instanceof Number number) {
            return number.longValue();
        }

        throw new IllegalArgumentException(
                "Unexpected numeric query result: " + value.getClass().getName()
        );
    }

    private LocalDate toLocalDate(Object value) {
        if (value instanceof Date date) {
            return date.toLocalDate();
        }

        if (value instanceof LocalDate date) {
            return date;
        }

        throw new IllegalArgumentException(
                "Unexpected date query result: " + value.getClass().getName()
        );
    }
}
