-- V019__create_verification_requests_table.sql

CREATE TABLE verification_requests (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    role VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    payment_id UUID,
    id_document_url VARCHAR(255),
    passport_photo_url VARCHAR(255),
    rejection_reason TEXT,
    reviewed_by_id UUID,
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE verification_request_certificates (
    request_id UUID NOT NULL,
    certificate_url VARCHAR(255) NOT NULL,
    CONSTRAINT fk_verification_request
        FOREIGN KEY (request_id)
        REFERENCES verification_requests(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_verification_requests_user_id ON verification_requests(user_id);
CREATE INDEX idx_verification_requests_status ON verification_requests(status);
