-- V004__create_users_module_tables.sql
-- Users module: developer profiles, employer profiles, and all related tables

-- ============================================================
-- 1. developer_profiles (depends on users)
-- ============================================================
CREATE TABLE developer_profiles (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    profile_photo VARCHAR(500),
    bio VARCHAR(300),
    current_last_role VARCHAR(255),
    years_of_experience VARCHAR(50),
    number_of_projects INT NOT NULL DEFAULT 0,
    availability_status VARCHAR(50) NOT NULL DEFAULT 'NOT_AVAILABLE',
    preferred_work_type VARCHAR(50),
    location_city VARCHAR(255),
    location_country VARCHAR(255),
    profile_visibility VARCHAR(50) NOT NULL DEFAULT 'PUBLIC',
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    linkedin_url VARCHAR(500),
    github_url VARCHAR(500),
    portfolio_url VARCHAR(500),
    public_email VARCHAR(255),
    public_phone VARCHAR(50),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_developer_profiles_user_id ON developer_profiles(user_id);
CREATE INDEX idx_developer_profiles_visibility ON developer_profiles(profile_visibility);
CREATE INDEX idx_developer_profiles_availability ON developer_profiles(availability_status);

-- ============================================================
-- 2. developer_skills (depends on developer_profiles)
-- ============================================================
CREATE TABLE developer_skills (
    id UUID PRIMARY KEY,
    developer_id UUID NOT NULL REFERENCES developer_profiles(id) ON DELETE CASCADE,
    skill VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_developer_skills_developer_id ON developer_skills(developer_id);

-- ============================================================
-- 3. developer_languages (depends on developer_profiles)
-- ============================================================
CREATE TABLE developer_languages (
    id UUID PRIMARY KEY,
    developer_id UUID NOT NULL REFERENCES developer_profiles(id) ON DELETE CASCADE,
    language VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_developer_languages_developer_id ON developer_languages(developer_id);

-- ============================================================
-- 4. developer_education (depends on developer_profiles)
-- ============================================================
CREATE TABLE developer_education (
    id UUID PRIMARY KEY,
    developer_id UUID NOT NULL REFERENCES developer_profiles(id) ON DELETE CASCADE,
    institution VARCHAR(255) NOT NULL,
    qualification VARCHAR(255) NOT NULL,
    year_completed INT NOT NULL,
    is_certification BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_developer_education_developer_id ON developer_education(developer_id);

-- ============================================================
-- 5. developer_certifications (depends on developer_profiles)
-- ============================================================
CREATE TABLE developer_certifications (
    id UUID PRIMARY KEY,
    developer_id UUID NOT NULL REFERENCES developer_profiles(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    issued_by VARCHAR(255) NOT NULL,
    year_issued INT NOT NULL,
    cert_url VARCHAR(500),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_developer_certifications_developer_id ON developer_certifications(developer_id);

-- ============================================================
-- 6. developer_oss_contributions (depends on developer_profiles)
-- ============================================================
CREATE TABLE developer_oss_contributions (
    id UUID PRIMARY KEY,
    developer_id UUID NOT NULL REFERENCES developer_profiles(id) ON DELETE CASCADE,
    project_name VARCHAR(255) NOT NULL,
    contribution_url VARCHAR(500),
    description TEXT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_developer_oss_developer_id ON developer_oss_contributions(developer_id);

-- ============================================================
-- 7. developer_achievements (depends on developer_profiles)
-- ============================================================
CREATE TABLE developer_achievements (
    id UUID PRIMARY KEY,
    developer_id UUID NOT NULL REFERENCES developer_profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    year INT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_developer_achievements_developer_id ON developer_achievements(developer_id);

-- ============================================================
-- 8. developer_projects (depends on developer_profiles)
-- ============================================================
CREATE TABLE developer_projects (
    id UUID PRIMARY KEY,
    developer_id UUID NOT NULL REFERENCES developer_profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    tech_stack VARCHAR(500),
    project_url VARCHAR(500),
    repo_url VARCHAR(500),
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_developer_projects_developer_id ON developer_projects(developer_id);

-- ============================================================
-- 9. endorsements (depends on developer_profiles + users)
-- ============================================================
CREATE TABLE endorsements (
    id UUID PRIMARY KEY,
    recipient_id UUID NOT NULL REFERENCES developer_profiles(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content VARCHAR(200) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_endorsements_recipient_id ON endorsements(recipient_id);
CREATE INDEX idx_endorsements_author_id ON endorsements(author_id);

-- ============================================================
-- 10. employer_profiles (depends on users)
-- ============================================================
CREATE TABLE employer_profiles (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    contact_person_name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    company_website VARCHAR(500),
    industry VARCHAR(255),
    company_size VARCHAR(50),
    location_hq VARCHAR(255),
    company_bio TEXT,
    logo_url VARCHAR(500),
    linkedin_url VARCHAR(500),
    twitter_url VARCHAR(500),
    is_approved BOOLEAN NOT NULL DEFAULT FALSE,
    is_pro_account BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_employer_profiles_user_id ON employer_profiles(user_id);
CREATE INDEX idx_employer_profiles_is_approved ON employer_profiles(is_approved);

-- ============================================================
-- 11. saved_developer_searches (depends on employer_profiles)
-- ============================================================
CREATE TABLE saved_developer_searches (
    id UUID PRIMARY KEY,
    employer_id UUID NOT NULL REFERENCES employer_profiles(id) ON DELETE CASCADE,
    search_name VARCHAR(255) NOT NULL,
    filter_criteria jsonb NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_saved_searches_employer_id ON saved_developer_searches(employer_id);

-- ============================================================
-- 12. bookmarked_developers (depends on employer_profiles + developer_profiles)
-- ============================================================
CREATE TABLE bookmarked_developers (
    id UUID PRIMARY KEY,
    employer_id UUID NOT NULL REFERENCES employer_profiles(id) ON DELETE CASCADE,
    developer_id UUID NOT NULL REFERENCES developer_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT uk_bookmarked_employer_developer UNIQUE (employer_id, developer_id)
);

CREATE INDEX idx_bookmarked_employers_employer_id ON bookmarked_developers(employer_id);
CREATE INDEX idx_bookmarked_employers_developer_id ON bookmarked_developers(developer_id);

-- ============================================================
-- 13. contact_requests (depends on employer_profiles + developer_profiles)
-- ============================================================
CREATE TABLE contact_requests (
    id UUID PRIMARY KEY,
    employer_id UUID NOT NULL REFERENCES employer_profiles(id) ON DELETE CASCADE,
    developer_id UUID NOT NULL REFERENCES developer_profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_contact_requests_employer_id ON contact_requests(employer_id);
CREATE INDEX idx_contact_requests_developer_id ON contact_requests(developer_id);
CREATE INDEX idx_contact_requests_created_at ON contact_requests(created_at);
