CREATE TABLE job_posts (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    posted_by_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    summary TEXT,
    description TEXT,
    company_name VARCHAR(255),
    location_city VARCHAR(255),
    location_country VARCHAR(255),
    job_type VARCHAR(50),
    work_type VARCHAR(50),
    experience_level VARCHAR(50),
    min_qualification VARCHAR(255),
    min_experience_years INT,
    salary_range_min DECIMAL(19, 4),
    salary_range_max DECIMAL(19, 4),
    salary_currency VARCHAR(10) DEFAULT 'KES',
    application_deadline DATE,
    source_url VARCHAR(255),
    is_peer_sourced BOOLEAN DEFAULT FALSE,
    visibility VARCHAR(50),
    status VARCHAR(50),
    upvote_count INT DEFAULT 0,
    is_flagged BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_job_posts_posted_by_id ON job_posts(posted_by_id);
CREATE INDEX idx_job_posts_status ON job_posts(status);
CREATE INDEX idx_job_posts_visibility ON job_posts(visibility);
CREATE INDEX idx_job_posts_upvote_count ON job_posts(upvote_count DESC);
CREATE INDEX idx_job_posts_created_at ON job_posts(created_at DESC);
CREATE INDEX idx_job_posts_is_peer_sourced ON job_posts(is_peer_sourced);

CREATE TABLE job_tags (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    job_id UUID NOT NULL,
    tag VARCHAR(255) NOT NULL,
    CONSTRAINT fk_job_tags_job_id FOREIGN KEY (job_id) REFERENCES job_posts(id) ON DELETE CASCADE
);

CREATE INDEX idx_job_tags_job_id ON job_tags(job_id);
CREATE INDEX idx_job_tags_tag ON job_tags(tag);

CREATE TABLE job_votes (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    job_id UUID NOT NULL,
    user_id UUID NOT NULL,
    vote_type VARCHAR(50) NOT NULL,
    CONSTRAINT fk_job_votes_job_id FOREIGN KEY (job_id) REFERENCES job_posts(id) ON DELETE CASCADE,
    CONSTRAINT uq_job_votes_job_user UNIQUE (job_id, user_id)
);

CREATE TABLE job_flags (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    job_id UUID NOT NULL,
    flagged_by_id UUID NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(50) NOT NULL,
    reviewed_by_id UUID,
    reviewed_at TIMESTAMP,
    CONSTRAINT fk_job_flags_job_id FOREIGN KEY (job_id) REFERENCES job_posts(id) ON DELETE CASCADE
);

CREATE INDEX idx_job_flags_job_id ON job_flags(job_id);
CREATE INDEX idx_job_flags_status ON job_flags(status);

CREATE TABLE job_applications (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    job_id UUID NOT NULL,
    applicant_id UUID NOT NULL,
    cover_letter TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    CONSTRAINT fk_job_applications_job_id FOREIGN KEY (job_id) REFERENCES job_posts(id) ON DELETE CASCADE,
    CONSTRAINT uq_job_applications_job_applicant UNIQUE (job_id, applicant_id)
);

CREATE INDEX idx_job_applications_job_id ON job_applications(job_id);
CREATE INDEX idx_job_applications_applicant_id ON job_applications(applicant_id);
