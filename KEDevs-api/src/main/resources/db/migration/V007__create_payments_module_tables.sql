-- V007__create_payments_module_tables.sql

-- Add is_verified column to employer_profiles (added in this module)
ALTER TABLE employer_profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT false;


CREATE TABLE platform_settings (
    id UUID PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value VARCHAR(500) NOT NULL,
    description VARCHAR(500),
    updated_by_admin_id UUID,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

-- Insert default pricing values
INSERT INTO platform_settings (id, setting_key, setting_value, description, created_at, updated_at) VALUES
(gen_random_uuid(), 'ANNUAL_FEE_DEVELOPER', '100', 'Annual membership fee for developers', NOW(), NOW()),
(gen_random_uuid(), 'ANNUAL_FEE_EMPLOYER', '200', 'Annual membership fee for employers', NOW(), NOW()),
(gen_random_uuid(), 'EMPLOYER_PRO_ANNUAL_FEE', '2000', 'Annual Pro upgrade fee for employers', NOW(), NOW()),
(gen_random_uuid(), 'VERIFIED_BADGE_DEVELOPER', '250', 'One-time verified badge fee for developers', NOW(), NOW()),
(gen_random_uuid(), 'VERIFIED_BADGE_EMPLOYER', '400', 'One-time verified badge fee for employers', NOW(), NOW()),
(gen_random_uuid(), 'SPOTLIGHT_DAY_FEE', '100', 'Dev of the Day spotlight fee', NOW(), NOW()),
(gen_random_uuid(), 'SPOTLIGHT_WEEK_FEE', '400', 'Dev of the Week spotlight fee', NOW(), NOW()),
(gen_random_uuid(), 'SEARCH_TOKEN_FEE', '500', 'One-time search token fee (3 uses)', NOW(), NOW()),
(gen_random_uuid(), 'SEARCH_TOKEN_USES', '3', 'Number of filter searches per token', NOW(), NOW());

-- 2. Payments
CREATE TABLE payments (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'KES',
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    mpesa_checkout_id VARCHAR(200),
    mpesa_receipt_no VARCHAR(100),
    phone_number VARCHAR(20) NOT NULL,
    metadata JSONB,
    paid_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_mpesa_checkout_id ON payments(mpesa_checkout_id);
CREATE INDEX idx_payments_type ON payments(type);
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);

-- 3. Subscriptions
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    amount_paid DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'KES',
    mpesa_receipt_no VARCHAR(100),
    payment_id UUID,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_end_date ON subscriptions(end_date);
CREATE INDEX idx_subscriptions_type ON subscriptions(type);
CREATE INDEX idx_subscriptions_user_type_status ON subscriptions(user_id, type, status);

-- 4. Search tokens
CREATE TABLE search_tokens (
    id UUID PRIMARY KEY,
    employer_id UUID NOT NULL,
    total_uses INT NOT NULL DEFAULT 3,
    used_count INT NOT NULL DEFAULT 0,
    payment_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_search_tokens_employer_id ON search_tokens(employer_id);
CREATE INDEX idx_search_tokens_available ON search_tokens(employer_id) WHERE used_count < total_uses;

-- 5. User flags
CREATE TABLE user_flags (
    id UUID PRIMARY KEY,
    flagged_user_id UUID NOT NULL,
    flagged_by_id UUID NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    reviewed_by_id UUID,
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_user_flags_flagged_user_id ON user_flags(flagged_user_id);
CREATE INDEX idx_user_flags_status ON user_flags(status);
CREATE INDEX idx_user_flags_flagged_by_id ON user_flags(flagged_by_id);
