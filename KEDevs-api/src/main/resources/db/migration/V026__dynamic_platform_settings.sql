-- V026__dynamic_platform_settings.sql

-- 1. Upsert specific requested price points & governance settings (updating existing, inserting new)
INSERT INTO platform_settings (id, setting_key, setting_value, description, created_at, updated_at) VALUES
(gen_random_uuid(), 'SPOTLIGHT_DAY_FEE', '100', 'Price in KES for a 24-hour spotlight slot', NOW(), NOW()),
(gen_random_uuid(), 'SPOTLIGHT_WEEK_FEE', '500', 'Price in KES for a 7-day spotlight slot', NOW(), NOW()),
(gen_random_uuid(), 'VERIFIED_BADGE_DEVELOPER', '400', 'Price in KES for developer badge application', NOW(), NOW()),
(gen_random_uuid(), 'HIRING_ASSIST_FEE', '500', 'Price in KES for 24 hours of Hiring Assist access', NOW(), NOW()),
(gen_random_uuid(), 'CONTACT_REQUEST_DAILY_LIMIT', '10', 'Max contact requests an employer can send per day', NOW(), NOW()),
(gen_random_uuid(), 'COMMENT_EDIT_WINDOW', '15', 'Minutes a user has to edit their comment', NOW(), NOW()),
(gen_random_uuid(), 'COMMENT_DELETE_WINDOW', '15', 'Minutes a user has to delete their comment', NOW(), NOW())
ON CONFLICT (setting_key) DO UPDATE SET
    setting_value = EXCLUDED.setting_value,
    description = EXCLUDED.description,
    updated_at = NOW();

-- 2. Remove any garbage or placeholder keys that aren't valid operational keys.
-- The actual codebase only relies on these foundational keys.
DELETE FROM platform_settings WHERE setting_key NOT IN (
    'ANNUAL_FEE_DEVELOPER', 'ANNUAL_FEE_EMPLOYER', 'EMPLOYER_PRO_ANNUAL_FEE',
    'VERIFIED_BADGE_DEVELOPER', 'VERIFIED_BADGE_EMPLOYER',
    'SPOTLIGHT_DAY_FEE', 'SPOTLIGHT_WEEK_FEE',
    'SEARCH_TOKEN_FEE', 'SEARCH_TOKEN_USES',
    'HIRING_ASSIST_FEE', 'CONTACT_REQUEST_DAILY_LIMIT',
    'COMMENT_EDIT_WINDOW', 'COMMENT_DELETE_WINDOW'
);
