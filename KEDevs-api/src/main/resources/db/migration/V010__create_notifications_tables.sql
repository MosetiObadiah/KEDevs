CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    category VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_category ON notifications(category);
CREATE INDEX idx_notifications_created_at_desc ON notifications(created_at DESC);
CREATE INDEX idx_notifications_user_id_is_read ON notifications(user_id, is_read);

CREATE TABLE notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    email_on_payment_receipt BOOLEAN NOT NULL DEFAULT true,
    email_on_job_application BOOLEAN NOT NULL DEFAULT true,
    email_on_job_flagged BOOLEAN NOT NULL DEFAULT true,
    email_on_subscription_expiry BOOLEAN NOT NULL DEFAULT true,
    email_on_spotlight_expired BOOLEAN NOT NULL DEFAULT true,
    email_on_spotlight_overridden BOOLEAN NOT NULL DEFAULT true,
    email_on_verified_badge BOOLEAN NOT NULL DEFAULT true,
    email_on_pro_upgrade BOOLEAN NOT NULL DEFAULT true,
    in_app_on_job_application BOOLEAN NOT NULL DEFAULT true,
    in_app_on_comment_reply BOOLEAN NOT NULL DEFAULT true,
    in_app_on_endorsement BOOLEAN NOT NULL DEFAULT true,
    in_app_on_flag_reviewed BOOLEAN NOT NULL DEFAULT true,
    in_app_on_spotlight_expired BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notification_preferences_user_id ON notification_preferences(user_id);
