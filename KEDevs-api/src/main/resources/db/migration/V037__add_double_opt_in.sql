-- V037__add_double_opt_in.sql
ALTER TABLE conversations ADD COLUMN developer_accepted BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE conversations ADD COLUMN employer_accepted BOOLEAN NOT NULL DEFAULT FALSE;

-- Automatically migrate any existing conversations to true so we don't break existing data
UPDATE conversations SET developer_accepted = TRUE, employer_accepted = TRUE;
