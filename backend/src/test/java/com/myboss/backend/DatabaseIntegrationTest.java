
package com.myboss.backend;

import com.myboss.backend.modules.business.entity.BusinessEntity;
import com.myboss.backend.modules.business.entity.BusinessMembershipEntity;
import com.myboss.backend.modules.business.entity.StaffInvitationEntity;
import com.myboss.backend.modules.business.enums.BusinessRole;
import com.myboss.backend.modules.business.enums.InvitationStatus;
import com.myboss.backend.modules.business.enums.MembershipStatus;
import com.myboss.backend.modules.business.repository.BusinessMembershipRepository;
import com.myboss.backend.modules.business.repository.BusinessRepository;
import com.myboss.backend.modules.business.repository.StaffInvitationRepository;
import com.myboss.backend.modules.identity.entity.UserEntity;
import com.myboss.backend.modules.identity.repository.UserRepository;
import com.myboss.backend.modules.task.entity.TaskEntity;
import com.myboss.backend.modules.task.enums.TaskStatus;
import com.myboss.backend.modules.task.repository.TaskRepository;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.List;
import java.util.HexFormat;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@Transactional
class DatabaseIntegrationTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BusinessRepository businessRepository;

    @Autowired
    private BusinessMembershipRepository membershipRepository;

    @Autowired
    private StaffInvitationRepository invitationRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private Flyway flyway;

    @Test
    void shouldPersistAndRetrieveCoreBusinessData() throws Exception {

        // 1. Create owner and staff users.

        String uniqueSuffix = UUID.randomUUID().toString();

        UserEntity owner = userRepository.saveAndFlush(
                new UserEntity(
                        "test_owner_" + uniqueSuffix,
                        "owner_" + uniqueSuffix + "@example.test",
                        "Test Owner"
                )
        );

        UserEntity staff = userRepository.saveAndFlush(
                new UserEntity(
                        "test_staff_" + uniqueSuffix,
                        "staff_" + uniqueSuffix + "@example.test",
                        "Test Staff"
                )
        );

        assertNotNull(owner.getId());
        assertNotNull(staff.getId());

        assertTrue(
                userRepository.existsByClerkUserId(owner.getClerkUserId())
        );

        // 2. Create a business.

        BusinessEntity business = businessRepository.saveAndFlush(
                new BusinessEntity("MyBoss Test Business")
        );

        assertNotNull(business.getId());

        // 3. Create owner and staff memberships.

        BusinessMembershipEntity ownerMembership =
                membershipRepository.saveAndFlush(
                        new BusinessMembershipEntity(
                                business.getId(),
                                owner.getId(),
                                BusinessRole.OWNER
                        )
                );

        BusinessMembershipEntity staffMembership =
                membershipRepository.saveAndFlush(
                        new BusinessMembershipEntity(
                                business.getId(),
                                staff.getId(),
                                BusinessRole.STAFF
                        )
                );

        assertEquals(
                BusinessRole.OWNER,
                ownerMembership.getRole()
        );

        assertEquals(
                MembershipStatus.ACTIVE,
                staffMembership.getStatus()
        );

        // 4. Create a staff invitation.

        String tokenHash = sha256(UUID.randomUUID().toString());

        StaffInvitationEntity invitation =
                invitationRepository.saveAndFlush(
                        new StaffInvitationEntity(
                                business.getId(),
                                ownerMembership.getId(),
                                tokenHash,
                                Instant.now().plusSeconds(86400)
                        )
                );

        assertNotNull(invitation.getId());

        assertTrue(
                invitationRepository.findByTokenHash(tokenHash).isPresent()
        );

        assertEquals(
                InvitationStatus.PENDING,
                invitation.getStatus()
        );

        // 5. Create a task assigned to the staff member.

        TaskEntity task = taskRepository.saveAndFlush(
                new TaskEntity(
                        business.getId(),
                        ownerMembership.getId(),
                        staffMembership.getId(),
                        "Complete daily stock check",
                        "Check the available inventory.",
                        Instant.now().plusSeconds(3600)
                )
        );

        assertNotNull(task.getId());

        // 6. Retrieve the task using its business ID.

        TaskEntity retrievedTask = taskRepository
                .findByBusinessIdAndIdAndDeletedAtIsNull(
                        business.getId(),
                        task.getId()
                )
                .orElseThrow();

        assertEquals(
                "Complete daily stock check",
                retrievedTask.getTitle()
        );

        assertEquals(
                staffMembership.getId(),
                retrievedTask.getAssignedToMembershipId()
        );

        assertEquals(
                TaskStatus.PENDING,
                retrievedTask.getStatus()
        );
    }

    @Test
    void shouldHaveSuccessfulFlywayMigrations() {

        for (String version : List.of("1", "2", "3", "4")) {
            Boolean migrationSuccessful = jdbcTemplate.queryForObject(
                    """
                    SELECT success
                    FROM public.flyway_schema_history
                    WHERE version = ?
                    """,
                    Boolean.class,
                    version
            );

            assertNotNull(migrationSuccessful);
            assertTrue(migrationSuccessful);
        }

        assertNotNull(flyway.info().current());
        assertEquals(
                "4",
                flyway.info().current().getVersion().getVersion()
        );
    }

    private String sha256(String value) throws Exception {

        MessageDigest digest = MessageDigest.getInstance("SHA-256");

        byte[] hash = digest.digest(
                value.getBytes(StandardCharsets.UTF_8)
        );

        return HexFormat.of().formatHex(hash);
    }
}
