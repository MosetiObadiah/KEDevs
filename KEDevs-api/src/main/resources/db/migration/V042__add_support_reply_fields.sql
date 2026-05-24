-- V042__add_support_reply_fields.sql
-- Add admin reply fields to contact_messages table

ALTER TABLE contact_messages
    ADD COLUMN IF NOT EXISTS admin_reply TEXT,
    ADD COLUMN IF NOT EXISTS replied_at  TIMESTAMP;
