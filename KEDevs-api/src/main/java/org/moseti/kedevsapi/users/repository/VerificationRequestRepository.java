package org.moseti.kedevsapi.users.repository;

import org.moseti.kedevsapi.shared.enums.VerificationStatus;
import org.moseti.kedevsapi.users.entity.VerificationRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface VerificationRequestRepository extends JpaRepository<VerificationRequest, UUID> {
    Optional<VerificationRequest> findByUserId(UUID userId);
    Optional<VerificationRequest> findByPaymentId(UUID paymentId);
    long countByStatus(VerificationStatus status);
}
