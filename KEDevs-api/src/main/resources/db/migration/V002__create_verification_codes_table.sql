-- Create verification_codes table
CREATE TABLE verification_codes (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    code VARCHAR(6) NOT NULL,
    type VARCHAR(50) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_verification_codes_user_id ON verification_codes(user_id);
CREATE INDEX idx_verification_codes_code ON verification_codes(code);
CREATE INDEX idx_verification_codes_type ON verification_codes(type);
CREATE INDEX idx_verification_codes_expires_at ON verification_codes(expires_at);

