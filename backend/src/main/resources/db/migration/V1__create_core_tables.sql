
-- =========================================================
-- MyBoss V1: Core Database Schema
-- Migration: V1__create_core_tables.sql
-- =========================================================

-- ---------------------------------------------------------
-- 1. USERS
-- Stores application profiles linked to Clerk identities.
-- ---------------------------------------------------------

CREATE TABLE users (
    id UUID PRIMARY KEY,

    clerk_user_id VARCHAR(255) NOT NULL,
    email VARCHAR(320) NOT NULL,
    full_name VARCHAR(150),

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_users_clerk_user_id
        UNIQUE (clerk_user_id),

    CONSTRAINT chk_users_email_not_blank
        CHECK (LENGTH(BTRIM(email)) > 0),

    CONSTRAINT chk_users_clerk_user_id_not_blank
        CHECK (LENGTH(BTRIM(clerk_user_id)) > 0)
);


-- ---------------------------------------------------------
-- 2. BUSINESSES
-- Stores registered business information.
-- ---------------------------------------------------------

CREATE TABLE businesses (
    id UUID PRIMARY KEY,

    name VARCHAR(150) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_businesses_name_not_blank
        CHECK (LENGTH(BTRIM(name)) > 0)
);


-- ---------------------------------------------------------
-- 3. BUSINESS MEMBERSHIPS
-- Connects users to businesses and defines their roles.
-- ---------------------------------------------------------

CREATE TABLE business_memberships (
    id UUID PRIMARY KEY,

    business_id UUID NOT NULL,
    user_id UUID NOT NULL,

    role VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_membership_business_user
        UNIQUE (business_id, user_id),

    -- Required for composite foreign keys in other tables.
    CONSTRAINT uq_membership_business_id
        UNIQUE (business_id, id),

    CONSTRAINT fk_membership_business
        FOREIGN KEY (business_id)
        REFERENCES businesses (id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_membership_user
        FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_membership_role
        CHECK (role IN ('OWNER', 'STAFF')),

    CONSTRAINT chk_membership_status
        CHECK (status IN ('ACTIVE', 'SUSPENDED'))
);


-- One OWNER membership per business.
CREATE UNIQUE INDEX uq_membership_one_owner_per_business
    ON business_memberships (business_id)
    WHERE role = 'OWNER';


-- A STAFF user can belong to only one business in v1.
CREATE UNIQUE INDEX uq_membership_staff_one_business
    ON business_memberships (user_id)
    WHERE role = 'STAFF';


-- Helps find all businesses associated with a user.
CREATE INDEX idx_memberships_user_id
    ON business_memberships (user_id);


-- ---------------------------------------------------------
-- 4. STAFF INVITATIONS
-- Stores secure staff invitation records.
-- ---------------------------------------------------------

CREATE TABLE staff_invitations (
    id UUID PRIMARY KEY,

    business_id UUID NOT NULL,

    created_by_membership_id UUID NOT NULL,
    accepted_by_membership_id UUID,

    token_hash CHAR(64) NOT NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',

    expires_at TIMESTAMPTZ NOT NULL,
    accepted_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_staff_invitation_token_hash
        UNIQUE (token_hash),

    CONSTRAINT fk_invitation_business
        FOREIGN KEY (business_id)
        REFERENCES businesses (id)
        ON DELETE RESTRICT,

    -- Invitation creator must belong to this business.
    CONSTRAINT fk_invitation_creator_membership
        FOREIGN KEY (business_id, created_by_membership_id)
        REFERENCES business_memberships (business_id, id)
        ON DELETE RESTRICT,

    -- Accepted membership must belong to this business.
    CONSTRAINT fk_invitation_accepted_membership
        FOREIGN KEY (business_id, accepted_by_membership_id)
        REFERENCES business_memberships (business_id, id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_invitation_status
        CHECK (
            status IN (
                'PENDING',
                'ACCEPTED',
                'EXPIRED',
                'REVOKED'
            )
        ),

    CONSTRAINT chk_invitation_expiry
        CHECK (expires_at > created_at),

    CONSTRAINT chk_invitation_token_hash
        CHECK (token_hash ~ '^[0-9a-f]{64}$'),

    CONSTRAINT chk_invitation_acceptance
        CHECK (
            (
                status = 'ACCEPTED'
                AND accepted_at IS NOT NULL
                AND accepted_by_membership_id IS NOT NULL
            )
            OR
            (
                status <> 'ACCEPTED'
                AND accepted_at IS NULL
                AND accepted_by_membership_id IS NULL
            )
        )
);


-- Only one PENDING invitation per business.
CREATE UNIQUE INDEX uq_staff_invitation_one_pending_per_business
    ON staff_invitations (business_id)
    WHERE status = 'PENDING';


CREATE INDEX idx_staff_invitations_business_status
    ON staff_invitations (business_id, status);


CREATE INDEX idx_staff_invitations_expiry
    ON staff_invitations (expires_at)
    WHERE status = 'PENDING';


-- ---------------------------------------------------------
-- 5. TASKS
-- Stores business tasks and their assignments.
-- ---------------------------------------------------------

CREATE TABLE tasks (
    id UUID PRIMARY KEY,

    business_id UUID NOT NULL,

    created_by_membership_id UUID NOT NULL,
    assigned_to_membership_id UUID,
    completed_by_membership_id UUID,

    title VARCHAR(200) NOT NULL,
    description TEXT,

    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',

    due_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,

    edited_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_task_business
        FOREIGN KEY (business_id)
        REFERENCES businesses (id)
        ON DELETE RESTRICT,

    -- Creator must belong to the same business.
    CONSTRAINT fk_task_creator_membership
        FOREIGN KEY (business_id, created_by_membership_id)
        REFERENCES business_memberships (business_id, id)
        ON DELETE RESTRICT,

    -- Assigned staff must belong to the same business.
    CONSTRAINT fk_task_assigned_membership
        FOREIGN KEY (business_id, assigned_to_membership_id)
        REFERENCES business_memberships (business_id, id)
        ON DELETE RESTRICT,

    -- Task completer must belong to the same business.
    CONSTRAINT fk_task_completed_membership
        FOREIGN KEY (business_id, completed_by_membership_id)
        REFERENCES business_memberships (business_id, id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_task_status
        CHECK (
            status IN ('PENDING', 'COMPLETED', 'CANCELLED')
        ),

    CONSTRAINT chk_task_title_not_blank
        CHECK (LENGTH(BTRIM(title)) > 0),

    CONSTRAINT chk_task_completion_fields
        CHECK (
            (completed_at IS NULL)
            =
            (completed_by_membership_id IS NULL)
        ),

    CONSTRAINT chk_completed_task_has_completion_data
        CHECK (
            status <> 'COMPLETED'
            OR (
                completed_at IS NOT NULL
                AND completed_by_membership_id IS NOT NULL
            )
        )
);


-- Retrieve tasks belonging to a business by status.
CREATE INDEX idx_tasks_business_status
    ON tasks (business_id, status)
    WHERE deleted_at IS NULL;


-- Retrieve tasks assigned to a particular member.
CREATE INDEX idx_tasks_assigned_membership
    ON tasks (business_id, assigned_to_membership_id)
    WHERE deleted_at IS NULL;


-- Retrieve tasks by due date.
CREATE INDEX idx_tasks_business_due_at
    ON tasks (business_id, due_at)
    WHERE deleted_at IS NULL
      AND due_at IS NOT NULL;


-- Retrieve tasks created by a particular member.
CREATE INDEX idx_tasks_created_by
    ON tasks (business_id, created_by_membership_id);


-- =========================================================
-- END OF V1 CORE DATABASE SCHEMA
-- =========================================================
