package com.myboss.backend.modules.notification.controller;

import com.myboss.backend.modules.notification.dto.NotificationResponse;
import com.myboss.backend.modules.notification.service.NotificationService;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/businesses/{businessId}/notifications")
public class NotificationController {
    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public Page<NotificationResponse> getNotifications(
            @PathVariable UUID businessId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return notificationService.getNotifications(businessId, page, size);
    }

    @GetMapping("/unread-count")
    public long unreadCount(@PathVariable UUID businessId) {
        return notificationService.unreadCount(businessId);
    }

    @PatchMapping("/{notificationId}/read")
    public void markRead(
            @PathVariable UUID businessId,
            @PathVariable UUID notificationId
    ) {
        notificationService.markRead(businessId, notificationId);
    }

    @PatchMapping("/read-all")
    public void markAllRead(@PathVariable UUID businessId) {
        notificationService.markAllRead(businessId);
    }
}
