package org.moseti.kedevsapi.jobs.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.moseti.kedevsapi.shared.entity.BaseEntity;
import org.moseti.kedevsapi.shared.enums.ApplicationStatus;

import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "job_applications", uniqueConstraints = @UniqueConstraint(columnNames = {"job_id", "applicant_id"}))
public class JobApplication extends BaseEntity {

    @Column(name = "job_id", nullable = false, insertable = false, updatable = false)
    private UUID jobId;

    @Column(name = "applicant_id", nullable = false)
    private UUID applicantId;

    @Column(name = "cover_letter", columnDefinition = "TEXT")
    private String coverLetter;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApplicationStatus status = ApplicationStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private JobPost jobPost;
}
