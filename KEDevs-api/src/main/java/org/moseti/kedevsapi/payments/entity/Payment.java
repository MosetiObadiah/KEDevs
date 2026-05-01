package org.moseti.kedevsapi.payments.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.moseti.kedevsapi.shared.entity.BaseEntity;
import org.moseti.kedevsapi.shared.enums.PaymentStatus;
import org.moseti.kedevsapi.shared.enums.PaymentType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "payments")
@Getter
@Setter
public class Payment extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentType type;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false)
    private String currency = "KES";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status = PaymentStatus.PENDING;

    @Column(name = "mpesa_checkout_id")
    private String mpesaCheckoutId;

    @Column(name = "mpesa_receipt_no")
    private String mpesaReceiptNo;

    @Column(name = "phone_number", nullable = false)
    private String phoneNumber;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String metadata;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;
}
