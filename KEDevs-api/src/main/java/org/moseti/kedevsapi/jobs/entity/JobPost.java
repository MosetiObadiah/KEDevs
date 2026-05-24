package org.moseti.kedevsapi.jobs.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.moseti.kedevsapi.jobs.converter.JobVisibilityConverter;
import org.moseti.kedevsapi.shared.entity.BaseEntity;
import org.moseti.kedevsapi.shared.enums.ExperienceLevel;
import org.moseti.kedevsapi.shared.enums.JobStatus;
import org.moseti.kedevsapi.shared.enums.JobType;
import org.moseti.kedevsapi.shared.enums.JobVisibility;
import org.moseti.kedevsapi.shared.enums.WorkType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "job_posts")
public class JobPost extends BaseEntity {

    @Column(name = "posted_by_id", nullable = false)
    private UUID postedById;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "company_name")
    private String companyName;

    @Column(name = "location_city")
    private String locationCity;

    @Column(name = "location_country")
    private String locationCountry;

    @Enumerated(EnumType.STRING)
    @Column(name = "job_type")
    private JobType jobType;

    @Enumerated(EnumType.STRING)
    @Column(name = "work_type")
    private WorkType workType;

    @Enumerated(EnumType.STRING)
    @Column(name = "experience_level")
    private ExperienceLevel experienceLevel;

    @Column(name = "min_qualification")
    private String minQualification;

    @Column(name = "min_experience_years")
    private Integer minExperienceYears;

    @Column(name = "salary_range_min")
    private BigDecimal salaryRangeMin;

    @Column(name = "salary_range_max")
    private BigDecimal salaryRangeMax;

    @Column(name = "salary_currency")
    private String salaryCurrency = "KES";

    @Column(name = "salary_not_specified", nullable = false)
    private boolean salaryNotSpecified = false;

    @Column(name = "application_deadline")
    private LocalDate applicationDeadline;

    @Column(name = "source_url")
    private String sourceUrl;

    @Column(name = "is_peer_sourced")
    private boolean isPeerSourced = false;

    @Convert(converter = JobVisibilityConverter.class)
    @Column(name = "visibility")
    private JobVisibility visibility;

    @Enumerated(EnumType.STRING)
    private JobStatus status;

    @Column(name = "upvote_count")
    private int upvoteCount = 0;

    @Column(name = "is_flagged")
    private boolean isFlagged = false;

    @Column(name = "is_pinned", nullable = false)
    private boolean isPinned = false;

    @Column(name = "pinned_until")
    private LocalDateTime pinnedUntil;

    @Column(name = "pinned_payment_id")
    private UUID pinnedPaymentId;
}
