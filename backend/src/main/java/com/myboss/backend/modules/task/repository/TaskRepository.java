package com.myboss.backend.modules.task.repository;

import com.myboss.backend.modules.task.entity.TaskEntity;
import com.myboss.backend.modules.task.enums.TaskStatus;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TaskRepository extends JpaRepository<TaskEntity, UUID> {

    Optional<TaskEntity> findByBusinessIdAndIdAndDeletedAtIsNull(
            UUID businessId,
            UUID id
    );

    List<TaskEntity> findAllByBusinessIdAndDeletedAtIsNull(
            UUID businessId
    );

    List<TaskEntity>
    findAllByBusinessIdAndAssignedToMembershipIdAndDeletedAtIsNull(
            UUID businessId,
            UUID membershipId
    );

    List<TaskEntity> findAllByBusinessIdAndStatusAndDeletedAtIsNull(
            UUID businessId,
            TaskStatus status
    );

    List<TaskEntity>
    findAllByBusinessIdAndStatusAndAssignedToMembershipIdAndDeletedAtIsNull(
            UUID businessId,
            TaskStatus status,
            UUID membershipId
    );
}