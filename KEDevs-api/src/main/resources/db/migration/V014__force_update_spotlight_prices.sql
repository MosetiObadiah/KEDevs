-- Update prices to user requested values
UPDATE platform_settings SET setting_value = '50' WHERE setting_key = 'SPOTLIGHT_DAY_FEE';
UPDATE platform_settings SET setting_value = '250' WHERE setting_key = 'SPOTLIGHT_WEEK_FEE';
UPDATE platform_settings SET setting_value = '250' WHERE setting_key = 'VERIFIED_BADGE_DEVELOPER';
UPDATE platform_settings SET setting_value = '100' WHERE setting_key = 'SEARCH_TOKEN_FEE';
