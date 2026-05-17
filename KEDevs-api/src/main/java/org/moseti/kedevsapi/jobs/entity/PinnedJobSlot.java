package org.moseti.kedevsapi.jobs.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.moseti.kedevsapi.shared.enums.PaymentType;
import org.moseti.kedevsapi.shared.entity.BaseEntity;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "pinned_job_slots")
public class PinnedJobSlot extends BaseEntity {

    @Column(name = "job_id", nullable = false)
    private UUID jobId;

    @Column(name = "employer_id", nullable = false)
    private UUID employerId;

    @Column(name = "duration_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private PaymentType durationType;

    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDateTime endDate;

    @Column(name = "payment_id", nullable = false)
    private UUID paymentId;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    @Column(name = "overridden_by_admin", nullable = false)
    private boolean overriddenByAdmin = false;
}
