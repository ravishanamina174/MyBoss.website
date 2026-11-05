package com.myboss.backend.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

@Service
public class CurrentUserService {

    public Jwt getCurrentJwt() {
        Authentication authentication =
            SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null ||
                !(authentication.getPrincipal() instanceof Jwt jwt)) {
            throw new IllegalStateException(
                "Authenticated JWT not found"
            );
        }

        return jwt;
    }

    public String getCurrentClerkUserId() {
        return getCurrentJwt().getSubject();
    }
}