CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    business_id UUID NOT NULL,
    user_id UUID NOT NULL,
    type VARCHAR(40) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message VARCHAR(500) NOT NULL,
    event_key VARCHAR(255) NOT NULL,
    related_task_id UUID,
    related_invitation_id UUID,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_notifications_event_key UNIQUE (event_key),
    CONSTRAINT fk_notification_business FOREIGN KEY (business_id)
        REFERENCES businesses (id) ON DELETE RESTRICT,
    CONSTRAINT fk_notification_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT fk_notification_task FOREIGN KEY (related_task_id)
        REFERENCES tasks (id) ON DELETE RESTRICT,
    CONSTRAINT fk_notification_invitation FOREIGN KEY (related_invitation_id)
        REFERENCES staff_invitations (id) ON DELETE RESTRICT,
    CONSTRAINT chk_notification_type CHECK (
        type IN (
            'TASK_ASSIGNED',
            'TASK_ASSIGNMENT_UPDATED',
            'TASK_ASSIGNMENT_CANCELLED',
            'TASK_COMPLETED',
            'INVITATION_CREATED',
            'INVITATION_ACCEPTED'
        )
    )
);

CREATE INDEX idx_notifications_user_business_created
    ON notifications (user_id, business_id, created_at DESC);

CREATE INDEX idx_notifications_user_unread
    ON notifications (user_id, business_id)
    WHERE read_at IS NULL;
