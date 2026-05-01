package org.moseti.kedevsapi.payments.repository;

import org.moseti.kedevsapi.payments.entity.Payment;
import org.moseti.kedevsapi.shared.enums.PaymentStatus;
import org.moseti.kedevsapi.shared.enums.PaymentType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {

    Page<Payment> findByUserId(UUID userId, Pageable pageable);

    Optional<Payment> findByMpesaCheckoutId(String checkoutId);

    Page<Payment> findByUserIdAndType(UUID userId, PaymentType type, Pageable pageable);

    Page<Payment> findByStatus(PaymentStatus status, Pageable pageable);
}
