package com.myboss.backend.modules.identity.repository;

import com.myboss.backend.modules.identity.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<UserEntity, UUID> {

    Optional<UserEntity> findByClerkUserId(String clerkUserId);

    boolean existsByClerkUserId(String clerkUserId);
}