-- V031__remove_deprecated_subscription_search_features.sql

-- Drop deprecated columns from users table
ALTER TABLE users DROP COLUMN IF EXISTS grace_period_ends_at;
ALTER TABLE users DROP COLUMN IF EXISTS subscription_expires_at;
ALTER TABLE users DROP COLUMN IF EXISTS subscription_active;

-- Drop deprecated columns from notification_preferences
ALTER TABLE notification_preferences DROP COLUMN IF EXISTS email_on_subscription_expiry;
ALTER TABLE notification_preferences DROP COLUMN IF EXISTS email_on_pro_upgrade;

-- Drop deprecated column from employer_profiles
ALTER TABLE employer_profiles DROP COLUMN IF EXISTS is_pro_account;

-- Drop deprecated tables
DROP TABLE IF EXISTS saved_developer_searches;
DROP TABLE IF EXISTS bookmarked_developers;
DROP TABLE IF EXISTS subscriptions;
DROP TABLE IF EXISTS search_tokens;

-- Remove deprecated platform settings
DELETE FROM platform_settings WHERE setting_key = 'HIRING_ASSIST_FEE';
