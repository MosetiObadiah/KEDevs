CREATE TABLE IF NOT EXISTS blocked_users (
    id UUID PRIMARY KEY,
    blocker_id UUID NOT NULL,
    blocked_id UUID NOT NULL,
    reason VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_blocker FOREIGN KEY (blocker_id) REFERENCES users(id),
    CONSTRAINT fk_blocked FOREIGN KEY (blocked_id) REFERENCES users(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_blocked_users_unique ON blocked_users (blocker_id, blocked_id);
