# MyBoss Database Design — v1

## 1. Database Architecture

- Database: PostgreSQL (Neon)
- Architecture: Relational database
- Primary keys: UUID
- Naming convention: snake_case
- ORM: Spring Data JPA / Hibernate
- Schema migrations: Flyway
- Authentication provider: Clerk
- Timestamp storage: UTC

## 2. Core Entities

### users
Stores application user profiles associated with Clerk.

### businesses
Stores business information.

### business_memberships
Connects users to businesses and stores their roles and membership status.

Roles:
- OWNER
- STAFF

Statuses:
- ACTIVE
- SUSPENDED

### staff_invitations
Manages staff invitation links.

Statuses:
- PENDING
- ACCEPTED
- EXPIRED
- REVOKED

Rules:
- Invitations expire after 24 hours.
- Only one active invitation per business.
- New invitations invalidate previous active invitations.
- Invitation tokens are stored as hashes.

### tasks
Stores business tasks and their assignments.

Statuses:
- PENDING
- COMPLETED
- CANCELLED

Rules:
- Owners create, edit, cancel and delete tasks.
- Staff can complete assigned tasks.
- Owner edits update edited_at.
- Deletion uses soft deletion.

## 3. Relationships

- Users have business memberships.
- Businesses contain business memberships.
- Businesses own staff invitations.
- Owners create staff invitations.
- Accepted invitations are associated with memberships.
- Businesses own tasks.
- Memberships create, receive and complete tasks.

## 4. Important Constraints

- Unique Clerk user ID.
- Unique business/user membership pair.
- One owner per business.
- Staff can belong to only one business in v1.
- Unique invitation token hash.
- One pending invitation per business.
- Tasks must reference memberships belonging to their business.

## 5. Security Decisions

- Clerk manages authentication.
- Passwords are not stored in PostgreSQL.
- Business data must be isolated by business ID.
- Invitation tokens are hashed.
- Optional NIC information must be encrypted and subject to
  appropriate access and retention controls.

## 6. Future Modules

The following modules will be designed separately:

- Customers
- Products
- Inventory
- Sales
- Reporting