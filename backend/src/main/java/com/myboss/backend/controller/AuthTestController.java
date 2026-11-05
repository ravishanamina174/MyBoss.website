
package com.myboss.backend.controller;

import java.util.Map;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthTestController {

    @GetMapping("/test")
    public Map<String, Object> testAuthentication(
            @AuthenticationPrincipal Jwt jwt) {

        return Map.of(
            "authenticated", true,
            "clerkUserId", jwt.getSubject(),
            "issuer", jwt.getIssuer().toString()
        );
    }
}
