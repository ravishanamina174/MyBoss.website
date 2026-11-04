# MyBoss Multi-Tenant Database Design

## Architecture

Shared PostgreSQL database and shared schema.
Every business-owned record is associated with business_id.

## Tenant Isolation

- Business-owned records must reference a business.
- Membership relationships must belong to the same business.
- Task creators, assignees and completers must belong to the task's business.
- Invitation creators and accepted memberships must belong to the invitation's business.
- API authorization must resolve the authenticated user's active membership.
- Client-provided business IDs are never trusted as authorization.

## Membership Rules

- One membership per user per business.
- One OWNER per business.
- STAFF users can belong to only one business in v1.
- Roles: OWNER, STAFF.
- Statuses: ACTIVE, SUSPENDED.

## Invitation Rules

- Store SHA-256 token hashes, not original tokens.
- Invitations expire after 24 hours.
- Only one PENDING invitation per business.
- New invitations revoke previous pending invitations.
- Invitation acceptance must be atomic.

## Task Rules

- Every task belongs to one business.
- Creator, assignee and completer must belong to that business.
- Staff can complete assigned tasks.
- Owners can edit, cancel and soft-delete tasks.
- Task edits update edited_at.

## Database Enforcement

- Foreign keys
- Composite foreign keys
- Unique constraints
- Partial unique indexes
- Check constraints
- Business-scoped indexes

Application authorization is also required.
Database constraints do not replace API authorization.