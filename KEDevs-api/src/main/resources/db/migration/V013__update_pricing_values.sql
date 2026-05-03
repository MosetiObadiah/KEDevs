-- V013__update_pricing_values.sql

UPDATE platform_settings SET setting_value = '1200' WHERE setting_key = 'ANNUAL_FEE_DEVELOPER';
UPDATE platform_settings SET setting_value = '2400' WHERE setting_key = 'ANNUAL_FEE_EMPLOYER';
UPDATE platform_settings SET setting_value = '5000' WHERE setting_key = 'EMPLOYER_PRO_ANNUAL_FEE';
UPDATE platform_settings SET setting_value = '250' WHERE setting_key = 'VERIFIED_BADGE_DEVELOPER';
UPDATE platform_settings SET setting_value = '500' WHERE setting_key = 'VERIFIED_BADGE_EMPLOYER';
UPDATE platform_settings SET setting_value = '50' WHERE setting_key = 'SPOTLIGHT_DAY_FEE';
UPDATE platform_settings SET setting_value = '250' WHERE setting_key = 'SPOTLIGHT_WEEK_FEE';
UPDATE platform_settings SET setting_value = '100' WHERE setting_key = 'SEARCH_TOKEN_FEE';
UPDATE platform_settings SET setting_value = '3' WHERE setting_key = 'SEARCH_TOKEN_USES';
