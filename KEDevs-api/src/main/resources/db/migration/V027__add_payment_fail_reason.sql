-- V027__add_payment_fail_reason.sql
-- Add fail_reason to persist M-Pesa cancellation/failure descriptions
ALTER TABLE payments ADD COLUMN IF NOT EXISTS fail_reason VARCHAR(500);
