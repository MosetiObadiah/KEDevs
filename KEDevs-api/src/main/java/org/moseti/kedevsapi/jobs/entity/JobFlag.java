package org.moseti.kedevsapi.jobs.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.moseti.kedevsapi.shared.entity.BaseEntity;
import org.moseti.kedevsapi.shared.enums.FlagStatus;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "job_flags")
public class JobFlag extends BaseEntity {

    @Column(name = "job_id", nullable = false, insertable = false, updatable = false)
    private UUID jobId;

    @Column(name = "flagged_by_id", nullable = false)
    private UUID flaggedById;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FlagStatus status;

    @Column(name = "reviewed_by_id")
    private UUID reviewedById;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private JobPost jobPost;
}
