package com.myboss.backend;

import com.myboss.backend.modules.business.entity.BusinessEntity;
import com.myboss.backend.modules.business.entity.BusinessMembershipEntity;
import com.myboss.backend.modules.business.enums.BusinessRole;
import com.myboss.backend.modules.business.enums.MembershipStatus;
import com.myboss.backend.modules.business.repository.BusinessMembershipRepository;
import com.myboss.backend.modules.business.repository.BusinessRepository;
import com.myboss.backend.modules.business.entity.StaffInvitationEntity;
import com.myboss.backend.modules.business.enums.InvitationStatus;
import com.myboss.backend.modules.business.repository.StaffInvitationRepository;
import com.myboss.backend.modules.identity.entity.UserEntity;
import com.myboss.backend.modules.identity.repository.UserRepository;
import com.myboss.backend.modules.task.entity.TaskEntity;
import com.myboss.backend.modules.task.repository.TaskRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class MultiTenantSecurityIntegrationTest {

    @Autowired MockMvc mvc;
    @Autowired UserRepository users;
    @Autowired BusinessRepository businesses;
    @Autowired BusinessMembershipRepository memberships;
    @Autowired TaskRepository tasks;
    @Autowired StaffInvitationRepository invitations;

    private BusinessEntity businessA;
    private BusinessEntity businessB;
    private UserEntity ownerA;
    private UserEntity ownerB;
    private UserEntity staffA;
    private BusinessMembershipEntity ownerMembershipA;
    private BusinessMembershipEntity ownerMembershipB;
    private BusinessMembershipEntity staffMembershipA;
    private TaskEntity taskA;
    private TaskEntity taskB;
    private StaffInvitationEntity invitationB;

    @BeforeEach
    void seed() {
        String suffix = UUID.randomUUID().toString();
        ownerA = users.saveAndFlush(new UserEntity("owner-a-" + suffix, "owner-a-" + suffix + "@test.invalid", "Owner A"));
        ownerB = users.saveAndFlush(new UserEntity("owner-b-" + suffix, "owner-b-" + suffix + "@test.invalid", "Owner B"));
        staffA = users.saveAndFlush(new UserEntity("staff-a-" + suffix, "staff-a-" + suffix + "@test.invalid", "Staff A"));
        businessA = businesses.saveAndFlush(new BusinessEntity("Business A"));
        businessB = businesses.saveAndFlush(new BusinessEntity("Business B"));
        ownerMembershipA = memberships.saveAndFlush(new BusinessMembershipEntity(businessA.getId(), ownerA.getId(), BusinessRole.OWNER));
        ownerMembershipB = memberships.saveAndFlush(new BusinessMembershipEntity(businessB.getId(), ownerB.getId(), BusinessRole.OWNER));
        staffMembershipA = memberships.saveAndFlush(new BusinessMembershipEntity(businessA.getId(), staffA.getId(), BusinessRole.STAFF));
        taskA = tasks.saveAndFlush(new TaskEntity(businessA.getId(), ownerMembershipA.getId(), staffMembershipA.getId(), "A task", "", Instant.now().plusSeconds(3600)));
        taskB = tasks.saveAndFlush(new TaskEntity(businessB.getId(), ownerMembershipB.getId(), null, "B task", "", Instant.now().plusSeconds(3600)));
        invitationB = invitations.saveAndFlush(new StaffInvitationEntity(
                businessB.getId(), ownerMembershipB.getId(),
                UUID.randomUUID().toString().replace("-", "") + UUID.randomUUID().toString().replace("-", ""),
                Instant.now().plus(1, ChronoUnit.HOURS)));
    }

    private SecurityMockMvcRequestPostProcessors.JwtRequestPostProcessor as(UserEntity user) {
        return jwt().jwt(jwt -> jwt.subject(user.getClerkUserId())
                .claim("email", user.getEmail()).claim("full_name", user.getFullName()));
    }

    @Test
    void unauthenticatedBusinessAccessIsRejected() throws Exception {
        mvc.perform(get("/api/businesses/{id}/access", businessA.getId()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void ownerCannotReadAnotherBusiness() throws Exception {
        mvc.perform(get("/api/businesses/{id}/access", businessB.getId()).with(as(ownerA)))
                .andExpect(status().isForbidden());
    }

    @Test
    void ownerCannotManageAnotherBusinessStaff() throws Exception {
        mvc.perform(get("/api/businesses/{id}/staff", businessB.getId()).with(as(ownerA)))
                .andExpect(status().isForbidden());
    }

    @Test
    void staffSeesOnlyAssignedTasksAndCannotCreate() throws Exception {
        mvc.perform(get("/api/businesses/{id}/tasks", businessA.getId()).with(as(staffA)))
                .andExpect(status().isOk());
        mvc.perform(get("/api/businesses/{id}/tasks/{taskId}", businessA.getId(), taskB.getId()).with(as(staffA)))
                .andExpect(status().isNotFound());
        mvc.perform(post("/api/businesses/{id}/tasks", businessA.getId()).with(as(staffA))
                        .contentType("application/json")
                        .content("{\"title\":\"forbidden\",\"description\":\"\",\"assignedToMembershipId\":null,\"dueAt\":null}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void suspendedStaffLosesBusinessAccess() throws Exception {
        staffMembershipA.suspend();
        memberships.saveAndFlush(staffMembershipA);
        mvc.perform(get("/api/businesses/{id}/access", businessA.getId()).with(as(staffA)))
                .andExpect(status().isForbidden());
    }

    @Test
    void pendingStaffLosesBusinessAccess() throws Exception {
        staffMembershipA.awaitApproval();
        memberships.saveAndFlush(staffMembershipA);
        mvc.perform(get("/api/businesses/{id}/access", businessA.getId()).with(as(staffA)))
                .andExpect(status().isForbidden());
    }

    @Test
    void legitimateOwnerAndStaffAccessTheirOwnBusiness() throws Exception {
        mvc.perform(get("/api/businesses/{id}/access", businessA.getId()).with(as(ownerA)))
                .andExpect(status().isOk());
        mvc.perform(get("/api/businesses/{id}/access", businessA.getId()).with(as(staffA)))
                .andExpect(status().isOk());
    }

    @Test
    void crossBusinessTaskAndReportAccessIsRejected() throws Exception {
        mvc.perform(get("/api/businesses/{id}/tasks", businessB.getId()).with(as(ownerA)))
                .andExpect(status().isForbidden());
        mvc.perform(get("/api/businesses/{id}/reports?from=2026-01-01T00:00:00Z&to=2026-01-02T00:00:00Z", businessB.getId()).with(as(ownerA)))
                .andExpect(status().isForbidden());
    }

    @Test
    void staffCannotReadOrChangeBusinessInformation() throws Exception {
        mvc.perform(get("/api/businesses/{id}/information", businessA.getId()).with(as(staffA)))
                .andExpect(status().isForbidden());
        mvc.perform(get("/api/businesses/{id}/information", businessB.getId()).with(as(ownerA)))
                .andExpect(status().isForbidden());
    }

    @Test
    void staffCannotModifyOrDeleteTasks() throws Exception {
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch("/api/businesses/{id}/tasks/{taskId}/cancel", businessA.getId(), taskA.getId()).with(as(staffA)))
                .andExpect(status().isForbidden());
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete("/api/businesses/{id}/tasks/{taskId}", businessA.getId(), taskA.getId()).with(as(staffA)))
                .andExpect(status().isForbidden());
    }

    @Test
    void staffCanCompleteTheirAssignedTask() throws Exception {
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch("/api/businesses/{id}/tasks/{taskId}/complete", businessA.getId(), taskA.getId()).with(as(staffA)))
                .andExpect(status().isOk());
    }

    @Test
    void crossBusinessInvitationCannotBeRevoked() throws Exception {
        mvc.perform(post("/api/businesses/{id}/invitations/{invitationId}/revoke", businessA.getId(), invitationB.getId()).with(as(ownerA)))
                .andExpect(status().isNotFound());
    }

    @Test
    void invalidInvitationTokenIsRejected() throws Exception {
        mvc.perform(post("/api/invitations/accept").with(as(staffA))
                        .contentType("application/json")
                        .content("{\"token\":\"invalid-token\"}"))
                .andExpect(status().isNotFound());
    }

    @Test
    void ownerCanReadOwnStaffAndReport() throws Exception {
        mvc.perform(get("/api/businesses/{id}/staff", businessA.getId()).with(as(ownerA)))
                .andExpect(status().isOk());
        mvc.perform(get("/api/businesses/{id}/reports?from=2026-01-01T00:00:00Z&to=2026-01-02T00:00:00Z", businessA.getId()).with(as(ownerA)))
                .andExpect(status().isOk());
    }

    @Test
    void staffCanReadOnlyTheirOwnReport() throws Exception {
        mvc.perform(get("/api/businesses/{id}/reports?from=2026-01-01T00:00:00Z&to=2026-01-02T00:00:00Z", businessA.getId()).with(as(staffA)))
                .andExpect(status().isOk());
    }

    @Test
    void crossBusinessNotificationsAreRejected() throws Exception {
        mvc.perform(get("/api/businesses/{id}/notifications", businessB.getId()).with(as(ownerA)))
                .andExpect(status().isForbidden());
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch(
                "/api/businesses/{id}/notifications/{notificationId}/read", businessB.getId(), UUID.randomUUID()).with(as(ownerA)))
                .andExpect(status().isForbidden());
    }

    @Test
    void ownerCannotUpdateAnotherBusinessProfile() throws Exception {
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put(
                "/api/businesses/{id}/information/profile", businessB.getId()).with(as(ownerA))
                        .contentType("application/json")
                        .content("{\"name\":\"tampered\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void staffCannotUpdateAnotherBusinessTask() throws Exception {
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch(
                "/api/businesses/{id}/tasks/{taskId}", businessA.getId(), taskA.getId()).with(as(staffA))
                        .contentType("application/json")
                        .content("{\"title\":\"tampered\",\"description\":\"\",\"assignedToMembershipId\":null,\"dueAt\":null}"))
                .andExpect(status().isForbidden());
    }
}
