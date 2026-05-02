package org.moseti.kedevsapi.spotlight.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.moseti.kedevsapi.shared.entity.BaseEntity;
import org.moseti.kedevsapi.shared.enums.SpotlightType;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "spotlight_slots")
public class SpotlightSlot extends BaseEntity {

    @Column(nullable = false)
    private UUID developerId;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private SpotlightType type;

    @Column(nullable = false)
    private LocalDateTime startDate;

    @Column(nullable = false)
    private LocalDateTime endDate;

    @Column(nullable = false)
    private UUID paymentId;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    @Column(name = "overridden_by_admin", nullable = false)
    private boolean overriddenByAdmin = false;
}
