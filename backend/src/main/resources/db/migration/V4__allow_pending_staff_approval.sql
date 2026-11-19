ALTER TABLE business_memberships DROP CONSTRAINT chk_membership_status;
ALTER TABLE business_memberships ADD CONSTRAINT chk_membership_status
    CHECK (status IN ('PENDING', 'ACTIVE', 'SUSPENDED'));
