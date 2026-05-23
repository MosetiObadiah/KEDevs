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

    Page<Payment> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);
    java.util.List<Payment> findByUserIdOrderByCreatedAtDesc(UUID userId);

    Optional<Payment> findByMpesaCheckoutId(String checkoutId);

    Page<Payment> findByUserIdAndType(UUID userId, PaymentType type, Pageable pageable);

    Page<Payment> findByStatus(PaymentStatus status, Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.status = 'COMPLETED'")
    java.math.BigDecimal getTotalRevenue();

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.status = 'COMPLETED' AND p.createdAt >= :since")
    java.math.BigDecimal getRevenueAfter(@org.springframework.data.repository.query.Param("since") java.time.LocalDateTime since);

    @org.springframework.data.jpa.repository.Query("SELECT p.type, COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.status = 'COMPLETED' GROUP BY p.type")
    java.util.List<Object[]> getRevenueByType();

    @org.springframework.data.jpa.repository.Query("SELECT CAST(p.createdAt AS DATE) as payDate, COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.status = 'COMPLETED' AND p.createdAt >= :since GROUP BY CAST(p.createdAt AS DATE) ORDER BY payDate ASC")
    java.util.List<Object[]> getRevenueTrends(@org.springframework.data.repository.query.Param("since") java.time.LocalDateTime since);

    long countByStatus(PaymentStatus status);

    Optional<Payment> findFirstByUserIdAndTypeInAndStatusInOrderByCreatedAtDesc(
            UUID userId,
            java.util.List<PaymentType> types,
            java.util.List<PaymentStatus> statuses
    );

    boolean existsByUserIdAndTypeAndStatus(UUID userId, PaymentType type, PaymentStatus status);

    java.util.List<Payment> findByStatusAndCreatedAtAfter(PaymentStatus status, java.time.LocalDateTime since);

    @org.springframework.data.jpa.repository.Query("SELECT new org.moseti.kedevsapi.payments.dto.PaymentDtos$AdminPaymentResponse(" +
           "p.id, p.type, p.amount, p.currency, p.status, p.mpesaReceiptNo, p.failReason, p.phoneNumber, p.paidAt, p.createdAt, " +
           "u.id, u.fullName, u.email, u.role) " +
           "FROM Payment p, org.moseti.kedevsapi.users.entity.User u " +
           "WHERE p.userId = u.id " +
           "AND (:#{#status == null} = true OR p.status = :status) " +
           "AND (:#{#role == null} = true OR u.role = :role) " +
           "AND (:#{#startDate == null} = true OR p.createdAt >= :startDate) " +
           "AND (:#{#endDate == null} = true OR p.createdAt <= :endDate)")
    Page<org.moseti.kedevsapi.payments.dto.PaymentDtos.AdminPaymentResponse> findAdminPayments(
            @org.springframework.data.repository.query.Param("status") PaymentStatus status,
            @org.springframework.data.repository.query.Param("role") org.moseti.kedevsapi.shared.enums.Role role,
            @org.springframework.data.repository.query.Param("startDate") java.time.LocalDateTime startDate,
            @org.springframework.data.repository.query.Param("endDate") java.time.LocalDateTime endDate,
            Pageable pageable
    );

    @org.springframework.data.jpa.repository.Query("SELECT new org.moseti.kedevsapi.payments.dto.PaymentDtos$AdminPaymentResponse(" +
           "p.id, p.type, p.amount, p.currency, p.status, p.mpesaReceiptNo, p.failReason, p.phoneNumber, p.paidAt, p.createdAt, " +
           "u.id, u.fullName, u.email, u.role) " +
           "FROM Payment p, org.moseti.kedevsapi.users.entity.User u " +
           "WHERE p.userId = u.id " +
           "AND (:status IS NULL OR p.status = :status) " +
           "AND (:role IS NULL OR u.role = :role) " +
           "AND (cast(:startDate as timestamp) IS NULL OR p.createdAt >= :startDate) " +
           "AND (cast(:endDate as timestamp) IS NULL OR p.createdAt <= :endDate) " +
           "ORDER BY p.createdAt DESC")
    java.util.List<org.moseti.kedevsapi.payments.dto.PaymentDtos.AdminPaymentResponse> findAdminPaymentsForExport(
            @org.springframework.data.repository.query.Param("status") PaymentStatus status,
            @org.springframework.data.repository.query.Param("role") org.moseti.kedevsapi.shared.enums.Role role,
            @org.springframework.data.repository.query.Param("startDate") java.time.LocalDateTime startDate,
            @org.springframework.data.repository.query.Param("endDate") java.time.LocalDateTime endDate
    );
}
