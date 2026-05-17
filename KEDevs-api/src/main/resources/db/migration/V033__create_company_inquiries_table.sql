CREATE TABLE IF NOT EXISTS company_inquiries (
    id UUID PRIMARY KEY,
    sender_user_id UUID NOT NULL,
    employer_profile_id UUID NOT NULL,
    message VARCHAR(1000) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sender_user FOREIGN KEY (sender_user_id) REFERENCES users(id),
    CONSTRAINT fk_employer_profile FOREIGN KEY (employer_profile_id) REFERENCES employer_profiles(id)
);
