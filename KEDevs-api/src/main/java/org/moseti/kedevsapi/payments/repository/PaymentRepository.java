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

    java.util.List<Payment> findAllByStatus(PaymentStatus status);

    Page<Payment> findByUserId(UUID userId, Pageable pageable);

    Optional<Payment> findByMpesaCheckoutId(String checkoutId);

    Page<Payment> findByUserIdAndType(UUID userId, PaymentType type, Pageable pageable);

    Page<Payment> findByStatus(PaymentStatus status, Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.status = 'COMPLETED'")
    java.math.BigDecimal getTotalRevenue();

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.status = 'COMPLETED' AND p.createdAt >= :since")
    java.math.BigDecimal getRevenueAfter(@org.springframework.data.repository.query.Param("since") java.time.LocalDateTime since);

    @org.springframework.data.jpa.repository.Query("SELECT p.type, COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.status = 'COMPLETED' GROUP BY p.type")
    java.util.List<Object[]> getRevenueByType();

    long countByStatus(PaymentStatus status);
}
