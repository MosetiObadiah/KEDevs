-- V017__enhance_developer_profile_tables.sql
-- Adding missing fields to developer profile related tables

-- 1. Enhance developer_education
ALTER TABLE developer_education ADD COLUMN field_of_study VARCHAR(255);
ALTER TABLE developer_education ADD COLUMN start_year INT;

-- 2. Enhance developer_certifications
-- Since we are changing type from INT to DATE, we drop and add or use a conversion.
-- For simplicity and precision as requested (issue date, expiry date), we'll add new columns and drop the old one.
ALTER TABLE developer_certifications ADD COLUMN issued_date DATE;
ALTER TABLE developer_certifications ADD COLUMN expiry_date DATE;

-- Migrate existing year_issued to issued_date (approximate to Jan 1st)
UPDATE developer_certifications SET issued_date = TO_DATE(year_issued || '-01-01', 'YYYY-MM-DD');

ALTER TABLE developer_certifications DROP COLUMN year_issued;
ALTER TABLE developer_certifications ALTER COLUMN issued_date SET NOT NULL;

-- 3. Enhance developer_oss_contributions
ALTER TABLE developer_oss_contributions ADD COLUMN role VARCHAR(255);

-- 4. Enhance developer_achievements
ALTER TABLE developer_achievements ADD COLUMN achievement_url VARCHAR(500);
