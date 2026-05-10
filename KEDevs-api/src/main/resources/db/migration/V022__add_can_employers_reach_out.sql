-- Migration to add can_employers_reach_out column to developer_profiles table
ALTER TABLE developer_profiles ADD COLUMN can_employers_reach_out BOOLEAN NOT NULL DEFAULT true;
