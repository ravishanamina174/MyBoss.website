package com.myboss.backend.modules.task.service;

import com.myboss.backend.modules.business.entity.BusinessMembershipEntity;
import com.myboss.backend.modules.business.enums.BusinessRole;
import com.myboss.backend.modules.business.enums.MembershipStatus;
import com.myboss.backend.modules.business.repository.BusinessMembershipRepository;
import com.myboss.backend.modules.business.service.BusinessAuthorizationService;

import com.myboss.backend.modules.task.dto.CreateTaskRequest;
import com.myboss.backend.modules.task.dto.TaskResponse;
import com.myboss.backend.modules.task.dto.UpdateTaskRequest;
import com.myboss.backend.modules.task.entity.TaskEntity;
import com.myboss.backend.modules.task.enums.TaskStatus;
import com.myboss.backend.modules.task.repository.TaskRepository;
import com.myboss.backend.modules.notification.service.NotificationService;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final BusinessMembershipRepository membershipRepository;
    private final BusinessAuthorizationService authorizationService;
    private final NotificationService notificationService;

    public TaskService(
            TaskRepository taskRepository,
            BusinessMembershipRepository membershipRepository,
            BusinessAuthorizationService authorizationService,
            NotificationService notificationService
    ) {
        this.taskRepository = taskRepository;
        this.membershipRepository = membershipRepository;
        this.authorizationService = authorizationService;
        this.notificationService = notificationService;
    }

    // CREATE TASK - OWNER ONLY

    @Transactional
    public TaskResponse createTask(
            UUID businessId,
            CreateTaskRequest request
    ) {
        BusinessMembershipEntity owner =
                authorizationService.requireOwner(businessId);

        validateAssignment(
                businessId,
                request.assignedToMembershipId()
        );

        TaskEntity task = new TaskEntity(
                businessId,
                owner.getId(),
                request.assignedToMembershipId(),
                request.title().trim(),
                request.description(),
                request.dueAt()
        );

        TaskEntity savedTask = taskRepository.save(task);
        notifyAssignment(savedTask, request.assignedToMembershipId(), null);
        return toResponse(savedTask);
    }

    // GET TASK LIST - OWNER OR STAFF

    @Transactional(readOnly = true)
    public List<TaskResponse> getTasks(
            UUID businessId,
            TaskStatus status
    ) {
        BusinessMembershipEntity membership =
                authorizationService.requireActiveMembership(businessId);

        List<TaskEntity> tasks;

        if (membership.getRole() == BusinessRole.OWNER) {

            tasks = status == null
                    ? taskRepository.findAllByBusinessIdAndDeletedAtIsNull(
                            businessId
                    )
                    : taskRepository.findAllByBusinessIdAndStatusAndDeletedAtIsNull(
                            businessId,
                            status
                    );

        } else {

            tasks = status == null
                    ? taskRepository
                            .findAllByBusinessIdAndAssignedToMembershipIdAndDeletedAtIsNull(
                                    businessId,
                                    membership.getId()
                            )
                    : taskRepository
                            .findAllByBusinessIdAndStatusAndAssignedToMembershipIdAndDeletedAtIsNull(
                                    businessId,
                                    status,
                                    membership.getId()
                            );
        }

        return tasks.stream()
                .map(this::toResponse)
                .toList();
    }

    // GET SINGLE TASK - OWNER OR ASSIGNED STAFF

    @Transactional(readOnly = true)
    public TaskResponse getTask(
            UUID businessId,
            UUID taskId
    ) {
        BusinessMembershipEntity membership =
                authorizationService.requireActiveMembership(businessId);

        TaskEntity task = getTaskOrThrow(businessId, taskId);

        validateTaskVisibility(task, membership);

        return toResponse(task);
    }

    // UPDATE TASK - OWNER ONLY

    @Transactional
    public TaskResponse updateTask(
            UUID businessId,
            UUID taskId,
            UpdateTaskRequest request
    ) {
        authorizationService.requireOwner(businessId);

        TaskEntity task = getTaskOrThrow(businessId, taskId);

        if (task.getStatus() != TaskStatus.PENDING) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Only pending tasks can be edited"
            );
        }

        validateAssignment(
                businessId,
                request.assignedToMembershipId()
        );

        UUID previousAssignee = task.getAssignedToMembershipId();
        task.updateDetails(
                request.title().trim(),
                request.description(),
                request.assignedToMembershipId(),
                request.dueAt()
        );

        notifyAssignment(task, request.assignedToMembershipId(), previousAssignee);
        return toResponse(task);
    }

    // COMPLETE TASK - ASSIGNED STAFF ONLY

    @Transactional
    public TaskResponse completeTask(
            UUID businessId,
            UUID taskId
    ) {
        BusinessMembershipEntity membership =
                authorizationService.requireActiveMembership(businessId);

        if (membership.getRole() != BusinessRole.STAFF) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only staff members can complete tasks"
            );
        }

        TaskEntity task = getTaskOrThrow(businessId, taskId);

        validateTaskVisibility(task, membership);

        try {
            task.complete(membership.getId());
        } catch (IllegalStateException exception) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    exception.getMessage()
            );
        }

        BusinessMembershipEntity creator = membershipRepository.findById(
                task.getCreatedByMembershipId()).orElse(null);
        if (creator != null) {
            notificationService.create(
                    businessId, creator.getUserId(), "TASK_COMPLETED",
                    "Task completed",
                    "A staff member completed \"" + task.getTitle() + "\".",
                    "TASK_COMPLETED:" + task.getId(), task.getId(), null);
        }
        return toResponse(task);
    }

    // CANCEL TASK - OWNER ONLY

    @Transactional
    public TaskResponse cancelTask(
            UUID businessId,
            UUID taskId
    ) {
        authorizationService.requireOwner(businessId);

        TaskEntity task = getTaskOrThrow(businessId, taskId);

        try {
            task.cancel();
        } catch (IllegalStateException exception) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    exception.getMessage()
            );
        }

        if (task.getAssignedToMembershipId() != null) {
            BusinessMembershipEntity assignee = membershipRepository.findById(
                    task.getAssignedToMembershipId()).orElse(null);
            if (assignee != null) {
                notificationService.create(
                        businessId, assignee.getUserId(), "TASK_ASSIGNMENT_CANCELLED",
                        "Task cancelled",
                        "The task \"" + task.getTitle() + "\" was cancelled.",
                        "TASK_ASSIGNMENT_CANCELLED:" + task.getId(),
                        task.getId(), null);
            }
        }
        return toResponse(task);
    }

    // SOFT DELETE TASK - OWNER ONLY

    @Transactional
    public void deleteTask(
            UUID businessId,
            UUID taskId
    ) {
        authorizationService.requireOwner(businessId);

        TaskEntity task = getTaskOrThrow(businessId, taskId);

        task.softDelete();
    }

    // VALIDATE ASSIGNED STAFF MEMBERSHIP

    private void validateAssignment(
            UUID businessId,
            UUID membershipId
    ) {
        if (membershipId == null) {
            return;
        }

        BusinessMembershipEntity membership =
                membershipRepository.findById(membershipId)
                        .orElseThrow(() -> new ResponseStatusException(
                                HttpStatus.BAD_REQUEST,
                                "Assigned staff membership not found"
                        ));

        if (!membership.getBusinessId().equals(businessId)
                || membership.getStatus() != MembershipStatus.ACTIVE
                || membership.getRole() != BusinessRole.STAFF) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Task can only be assigned to an active staff member of this business"
            );
        }
    }

    // VALIDATE TASK VISIBILITY FOR STAFF

    private void validateTaskVisibility(
            TaskEntity task,
            BusinessMembershipEntity membership
    ) {
        if (membership.getRole() == BusinessRole.STAFF
                && !membership.getId().equals(
                        task.getAssignedToMembershipId()
                )) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You can only access tasks assigned to you"
            );
        }

    }

    private void notifyAssignment(
            TaskEntity task,
            UUID assigneeId,
            UUID previousAssigneeId
    ) {
        if (previousAssigneeId != null && !previousAssigneeId.equals(assigneeId)) {
            BusinessMembershipEntity previous = membershipRepository.findById(previousAssigneeId)
                    .orElse(null);
            if (previous != null) {
                notificationService.create(
                        task.getBusinessId(), previous.getUserId(),
                        "TASK_ASSIGNMENT_CANCELLED", "Task assignment updated",
                        "The task \"" + task.getTitle() + "\" is no longer assigned to you.",
                        "TASK_ASSIGNMENT_CANCELLED:" + task.getId() + ":" + previousAssigneeId,
                        task.getId(), null);
            }
        }
        if (assigneeId == null) return;
        BusinessMembershipEntity assignee = membershipRepository.findById(assigneeId)
                .orElse(null);
        if (assignee != null) {
            String type = previousAssigneeId == null
                    ? "TASK_ASSIGNED" : "TASK_ASSIGNMENT_UPDATED";
            notificationService.create(
                    task.getBusinessId(), assignee.getUserId(), type,
                    previousAssigneeId == null ? "New task assigned" : "Task assignment updated",
                    "You have been assigned \"" + task.getTitle() + "\".",
                    type + ":" + task.getId() + ":" + assigneeId,
                    task.getId(), null);
        }
    }

    // FIND TASK WITH BUSINESS ISOLATION

    private TaskEntity getTaskOrThrow(
            UUID businessId,
            UUID taskId
    ) {
        return taskRepository
                .findByBusinessIdAndIdAndDeletedAtIsNull(
                        businessId,
                        taskId
                )
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Task not found"
                ));
    }

    // ENTITY TO RESPONSE DTO

    private TaskResponse toResponse(TaskEntity task) {
        return new TaskResponse(
                task.getId(),
                task.getBusinessId(),
                task.getCreatedByMembershipId(),
                task.getAssignedToMembershipId(),
                task.getCompletedByMembershipId(),
                task.getTitle(),
                task.getDescription(),
                task.getStatus().name(),
                task.getDueAt(),
                task.getCompletedAt(),
                task.getEditedAt(),
                task.getCreatedAt(),
                task.getUpdatedAt()
        );
    }
}