CREATE TABLE pinned_job_slots (
    id UUID PRIMARY KEY,
    job_id UUID NOT NULL REFERENCES job_posts(id) ON DELETE CASCADE,
    employer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    duration_type VARCHAR(50) NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    payment_id UUID NOT NULL REFERENCES payments(id),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    overridden_by_admin BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pinned_job_slots_job_id ON pinned_job_slots(job_id);
CREATE INDEX idx_pinned_job_slots_employer_id ON pinned_job_slots(employer_id);
CREATE INDEX idx_pinned_job_slots_end_date ON pinned_job_slots(end_date);
