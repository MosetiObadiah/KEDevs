package org.moseti.kedevsapi.forum.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import org.moseti.kedevsapi.shared.entity.BaseEntity;

import java.util.UUID;

/**
 * Threading rule: Replies cannot have their own replies. 
 * Depth is enforced in the SERVICE layer, not the database.
 */
@Entity
@Table(name = "forum_comments")
@Getter
@Setter
public class ForumComment extends BaseEntity {

    @Column(name = "job_id", nullable = false)
    private UUID jobId;

    @Column(name = "author_id", nullable = false)
    private UUID authorId;

    @Column(name = "parent_comment_id")
    private UUID parentCommentId;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(name = "upvote_count", nullable = false)
    private int upvoteCount = 0;

    @Column(name = "is_hidden", nullable = false)
    private boolean isHidden = false;

    @Column(name = "is_flagged", nullable = false)
    private boolean isFlagged = false;
}
