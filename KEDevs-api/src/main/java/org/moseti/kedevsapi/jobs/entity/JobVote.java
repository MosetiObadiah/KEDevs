package org.moseti.kedevsapi.jobs.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.moseti.kedevsapi.shared.entity.BaseEntity;
import org.moseti.kedevsapi.shared.enums.VoteType;

import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "job_votes", uniqueConstraints = @UniqueConstraint(columnNames = {"job_id", "user_id"}))
public class JobVote extends BaseEntity {

    @Column(name = "job_id", nullable = false, insertable = false, updatable = false)
    private UUID jobId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "vote_type", nullable = false)
    private VoteType voteType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private JobPost jobPost;
}
