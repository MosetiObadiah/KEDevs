package org.moseti.kedevsapi.forum.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.moseti.kedevsapi.shared.entity.BaseEntity;
import org.moseti.kedevsapi.shared.enums.CommentFlagStatus;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "comment_flags")
@Getter
@Setter
public class CommentFlag extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "comment_id", nullable = false)
    private ForumComment comment;

    @Column(name = "flagged_by_id", nullable = false)
    private UUID flaggedById;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CommentFlagStatus status = CommentFlagStatus.PENDING;

    @Column(name = "reviewed_by_id")
    private UUID reviewedById;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;
}
