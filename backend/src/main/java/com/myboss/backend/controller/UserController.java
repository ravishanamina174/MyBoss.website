package com.myboss.backend.controller;

import java.util.UUID;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.myboss.backend.modules.identity.entity.UserEntity;
import com.myboss.backend.service.UserSyncService;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserSyncService userSyncService;

    public UserController(UserSyncService userSyncService) {
        this.userSyncService = userSyncService;
    }

    @GetMapping("/me")
    public CurrentUserResponse getCurrentUser() {

        UserEntity user = userSyncService.syncCurrentUser();

        return new CurrentUserResponse(
            user.getId(),
            user.getClerkUserId(),
            user.getEmail(),
            user.getFullName()
        );
    }

    public record CurrentUserResponse(
        UUID id,
        String clerkUserId,
        String email,
        String fullName
    ) {}
}