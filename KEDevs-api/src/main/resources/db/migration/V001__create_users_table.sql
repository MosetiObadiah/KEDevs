-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    auth_provider VARCHAR(50) NOT NULL DEFAULT 'LOCAL',
    google_id VARCHAR(255),
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    account_status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    grace_period_ends_at TIMESTAMP,
    subscription_expires_at TIMESTAMP,
    subscription_active BOOLEAN NOT NULL DEFAULT FALSE,
    approved_by_admin BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_users_role ON users(role);

