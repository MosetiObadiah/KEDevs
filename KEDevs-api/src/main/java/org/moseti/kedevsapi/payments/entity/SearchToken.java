package org.moseti.kedevsapi.payments.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.moseti.kedevsapi.shared.entity.BaseEntity;

import java.util.UUID;

@Entity
@Table(name = "search_tokens")
@Getter
@Setter
public class SearchToken extends BaseEntity {

    @Column(name = "employer_id", nullable = false)
    private UUID employerId;

    @Column(name = "total_uses", nullable = false)
    private int totalUses = 3;

    @Column(name = "used_count", nullable = false)
    private int usedCount = 0;

    @Column(name = "payment_id", nullable = false)
    private UUID paymentId;

    public int getRemainingUses() {
        return totalUses - usedCount;
    }

    public boolean hasUsesLeft() {
        return getRemainingUses() > 0;
    }
}
