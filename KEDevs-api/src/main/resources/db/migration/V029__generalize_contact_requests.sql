-- V029__generalize_contact_requests.sql
-- Generalize contact requests to support general authenticated senders (users) instead of just employers

-- 1. Drop foreign key constraint referencing employer_profiles(id)
ALTER TABLE contact_requests DROP CONSTRAINT IF EXISTS contact_requests_employer_id_fkey;

-- 2. Backfill existing employer_id column with user_id from employer_profiles table
UPDATE contact_requests cr
SET employer_id = ep.user_id
FROM employer_profiles ep
WHERE cr.employer_id = ep.id;

-- 3. Rename column employer_id to sender_user_id
ALTER TABLE contact_requests RENAME COLUMN employer_id TO sender_user_id;

-- 4. Re-establish foreign key pointing to users(id) instead
ALTER TABLE contact_requests 
ADD CONSTRAINT fk_contact_requests_sender_user 
FOREIGN KEY (sender_user_id) REFERENCES users(id) ON DELETE CASCADE;

-- 5. Rename index for consistency
ALTER INDEX IF EXISTS idx_contact_requests_employer_id RENAME TO idx_contact_requests_sender_user_id;
