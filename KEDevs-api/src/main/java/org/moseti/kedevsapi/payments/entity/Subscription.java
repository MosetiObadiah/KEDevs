package org.moseti.kedevsapi.payments.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.moseti.kedevsapi.shared.entity.BaseEntity;
import org.moseti.kedevsapi.shared.enums.SubscriptionStatus;
import org.moseti.kedevsapi.shared.enums.SubscriptionType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "subscriptions")
@Getter
@Setter
public class Subscription extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubscriptionType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubscriptionStatus status = SubscriptionStatus.ACTIVE;

    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDateTime endDate;

    @Column(name = "amount_paid", nullable = false, precision = 10, scale = 2)
    private BigDecimal amountPaid;

    @Column(nullable = false)
    private String currency = "KES";

    @Column(name = "mpesa_receipt_no")
    private String mpesaReceiptNo;

    @Column(name = "payment_id")
    private UUID paymentId;
}
