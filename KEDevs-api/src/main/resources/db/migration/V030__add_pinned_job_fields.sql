-- V030__add_pinned_job_fields.sql
-- Adds pinned job columns to job_posts and seeds pinned job pricing in platform_settings.
-- Also removes pricing keys that are no longer in use.

-- 1. Pinned columns on job_posts
ALTER TABLE job_posts
    ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS pinned_until TIMESTAMP,
    ADD COLUMN IF NOT EXISTS pinned_payment_id UUID;

-- Index for fast expiry scheduler lookups
CREATE INDEX IF NOT EXISTS idx_job_posts_pinned_expiry
    ON job_posts (is_pinned, pinned_until)
    WHERE is_pinned = TRUE;

-- 2. Add pinned job price settings
INSERT INTO platform_settings (id, setting_key, setting_value, description, created_at, updated_at) VALUES
    (gen_random_uuid(), 'PINNED_JOB_DAY_FEE',   '50',  'Price in KES to pin a job post for 1 day',  NOW(), NOW()),
    (gen_random_uuid(), 'PINNED_JOB_3DAYS_FEE', '100', 'Price in KES to pin a job post for 3 days', NOW(), NOW()),
    (gen_random_uuid(), 'PINNED_JOB_7DAYS_FEE', '200', 'Price in KES to pin a job post for 7 days', NOW(), NOW())
ON CONFLICT (setting_key) DO UPDATE SET
    setting_value = EXCLUDED.setting_value,
    description   = EXCLUDED.description,
    updated_at    = NOW();

-- 3. Remove deprecated pricing keys no longer used by the application
DELETE FROM platform_settings WHERE setting_key IN (
    'ANNUAL_FEE_DEVELOPER',
    'ANNUAL_FEE_EMPLOYER',
    'EMPLOYER_PRO_ANNUAL_FEE',
    'SEARCH_TOKEN_FEE',
    'SEARCH_TOKEN_USES'
);
