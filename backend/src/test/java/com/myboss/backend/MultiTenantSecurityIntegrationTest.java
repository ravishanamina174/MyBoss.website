package com.myboss.backend;

import com.myboss.backend.modules.business.entity.BusinessEntity;
import com.myboss.backend.modules.business.entity.BusinessMembershipEntity;
import com.myboss.backend.modules.business.enums.BusinessRole;
import com.myboss.backend.modules.business.enums.MembershipStatus;
import com.myboss.backend.modules.business.repository.BusinessMembershipRepository;
import com.myboss.backend.modules.business.repository.BusinessRepository;
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
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.Instant;
import java.util.UUID;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
class MultiTenantSecurityIntegrationTest {
    @Container
    static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:16-alpine");

    @DynamicPropertySource
    static void databaseProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGRES::getUsername);
        registry.add("spring.datasource.password", POSTGRES::getPassword);
        registry.add("clerk.issuer", () -> "https://test.clerk.accounts.dev");
        registry.add("clerk.jwks-uri", () -> "https://test.clerk.accounts.dev/.well-known/jwks.json");
    }

    @Autowired MockMvc mvc;
    @Autowired UserRepository users;
    @Autowired BusinessRepository businesses;
    @Autowired BusinessMembershipRepository memberships;
    @Autowired TaskRepository tasks;

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
    }

    private SecurityMockMvcRequestPostProcessors.JwtRequestPostProcessor as(UserEntity user) {
        return jwt().jwt(jwt -> jwt.subject(user.getClerkUserId()));
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
}
