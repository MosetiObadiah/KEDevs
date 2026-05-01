package org.moseti.kedevsapi.payments.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.moseti.kedevsapi.shared.entity.BaseEntity;
import org.moseti.kedevsapi.shared.enums.UserFlagStatus;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_flags")
@Getter
@Setter
public class UserFlag extends BaseEntity {

    @Column(name = "flagged_user_id", nullable = false)
    private UUID flaggedUserId;

    @Column(name = "flagged_by_id", nullable = false)
    private UUID flaggedById;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserFlagStatus status = UserFlagStatus.PENDING;

    @Column(name = "reviewed_by_id")
    private UUID reviewedById;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;
}
