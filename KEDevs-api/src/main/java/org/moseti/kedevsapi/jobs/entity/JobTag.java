package org.moseti.kedevsapi.jobs.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.moseti.kedevsapi.shared.entity.BaseEntity;

import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "job_tags")
public class JobTag extends BaseEntity {

    @Column(name = "job_id", nullable = false, insertable = false, updatable = false)
    private UUID jobId;

    @Column(nullable = false)
    private String tag;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private JobPost jobPost;
}
