-- V006__create_forum_module_tables.sql

CREATE TABLE forum_comments (
    id UUID PRIMARY KEY,
    job_id UUID NOT NULL,
    author_id UUID NOT NULL,
    parent_comment_id UUID REFERENCES forum_comments(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    upvote_count INT NOT NULL DEFAULT 0,
    is_hidden BOOLEAN NOT NULL DEFAULT false,
    is_flagged BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE comment_votes (
    id UUID PRIMARY KEY,
    comment_id UUID NOT NULL REFERENCES forum_comments(id),
    user_id UUID NOT NULL,
    vote_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT uk_comment_vote_user UNIQUE (comment_id, user_id)
);

CREATE TABLE comment_flags (
    id UUID PRIMARY KEY,
    comment_id UUID NOT NULL REFERENCES forum_comments(id),
    flagged_by_id UUID NOT NULL,
    reason TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    reviewed_by_id UUID,
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_forum_comments_job_id ON forum_comments(job_id);
CREATE INDEX idx_forum_comments_author_id ON forum_comments(author_id);
CREATE INDEX idx_forum_comments_parent_comment_id ON forum_comments(parent_comment_id);
CREATE INDEX idx_forum_comments_job_hidden ON forum_comments(job_id, is_hidden);
CREATE INDEX idx_forum_comments_upvote_count ON forum_comments(upvote_count DESC);
CREATE INDEX idx_forum_comments_created_at ON forum_comments(created_at DESC);

CREATE INDEX idx_comment_flags_comment_id ON comment_flags(comment_id);
CREATE INDEX idx_comment_flags_status ON comment_flags(status);
