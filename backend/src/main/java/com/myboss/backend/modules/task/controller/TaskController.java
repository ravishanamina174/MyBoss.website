package com.myboss.backend.modules.task.controller;

import com.myboss.backend.modules.task.dto.CreateTaskRequest;
import com.myboss.backend.modules.task.dto.TaskResponse;
import com.myboss.backend.modules.task.dto.UpdateTaskRequest;
import com.myboss.backend.modules.task.enums.TaskStatus;
import com.myboss.backend.modules.task.service.TaskService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/businesses/{businessId}/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    // CREATE TASK

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TaskResponse createTask(
            @PathVariable UUID businessId,
            @Valid @RequestBody CreateTaskRequest request
    ) {
        return taskService.createTask(businessId, request);
    }

    // GET TASK LIST

    @GetMapping
    public List<TaskResponse> getTasks(
            @PathVariable UUID businessId,
            @RequestParam(required = false) TaskStatus status
    ) {
        return taskService.getTasks(businessId, status);
    }

    // GET SINGLE TASK

    @GetMapping("/{taskId}")
    public TaskResponse getTask(
            @PathVariable UUID businessId,
            @PathVariable UUID taskId
    ) {
        return taskService.getTask(businessId, taskId);
    }

    // UPDATE TASK

    @PatchMapping("/{taskId}")
    public TaskResponse updateTask(
            @PathVariable UUID businessId,
            @PathVariable UUID taskId,
            @Valid @RequestBody UpdateTaskRequest request
    ) {
        return taskService.updateTask(
                businessId,
                taskId,
                request
        );
    }

    // COMPLETE TASK

    @PatchMapping("/{taskId}/complete")
    public TaskResponse completeTask(
            @PathVariable UUID businessId,
            @PathVariable UUID taskId
    ) {
        return taskService.completeTask(businessId, taskId);
    }

    // CANCEL TASK

    @PatchMapping("/{taskId}/cancel")
    public TaskResponse cancelTask(
            @PathVariable UUID businessId,
            @PathVariable UUID taskId
    ) {
        return taskService.cancelTask(businessId, taskId);
    }

    // SOFT DELETE TASK

    @DeleteMapping("/{taskId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTask(
            @PathVariable UUID businessId,
            @PathVariable UUID taskId
    ) {
        taskService.deleteTask(businessId, taskId);
    }
}