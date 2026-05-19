-- V038__add_chat_blocking_and_deletion.sql
ALTER TABLE conversations ADD COLUMN blocked_by_developer BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE conversations ADD COLUMN blocked_by_employer BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE conversations ADD COLUMN deleted_by_developer BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE conversations ADD COLUMN deleted_by_employer BOOLEAN NOT NULL DEFAULT FALSE;
