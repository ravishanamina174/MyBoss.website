package com.myboss.backend.modules.business.repository;

import com.myboss.backend.modules.business.entity.BusinessEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;
import java.util.Optional;

public interface BusinessRepository extends JpaRepository<BusinessEntity, UUID> {
    Optional<BusinessEntity> findByPublicIdentifier(String publicIdentifier);
}