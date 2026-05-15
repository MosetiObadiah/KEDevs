-- V028__simplify_availability_status.sql
-- Map legacy AVAILABLE status to OPEN_TO_OFFERS
UPDATE developer_profiles
SET availability_status = 'OPEN_TO_OFFERS'
WHERE availability_status = 'AVAILABLE';

-- Map any other non-compliant statuses to NOT_AVAILABLE
UPDATE developer_profiles
SET availability_status = 'NOT_AVAILABLE'
WHERE availability_status NOT IN ('OPEN_TO_OFFERS', 'NOT_AVAILABLE');
