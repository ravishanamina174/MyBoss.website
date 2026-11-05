
package com.myboss.backend.service;

import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.myboss.backend.modules.identity.entity.UserEntity;
import com.myboss.backend.modules.identity.repository.UserRepository;
import com.myboss.backend.security.CurrentUserService;

@Service
public class UserSyncService {

    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;

    public UserSyncService(
            UserRepository userRepository,
            CurrentUserService currentUserService) {

        this.userRepository = userRepository;
        this.currentUserService = currentUserService;
    }

    @Transactional
    public UserEntity syncCurrentUser() {

        Jwt jwt = currentUserService.getCurrentJwt();

        String clerkUserId = jwt.getSubject();
        String email = jwt.getClaimAsString("email");
        String fullName = jwt.getClaimAsString("full_name");

        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(
                HttpStatus.UNPROCESSABLE_ENTITY,
                "Email claim missing from Clerk token"
            );
        }

        UserEntity user = userRepository
            .findByClerkUserId(clerkUserId)
            .orElseGet(() ->
                new UserEntity(clerkUserId, email, fullName)
            );

        user.updateProfile(email, fullName);

        return userRepository.save(user);
    }
}
