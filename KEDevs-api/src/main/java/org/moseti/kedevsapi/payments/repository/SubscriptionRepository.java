package org.moseti.kedevsapi.payments.repository;

import org.moseti.kedevsapi.payments.entity.Subscription;
import org.moseti.kedevsapi.shared.enums.SubscriptionStatus;
import org.moseti.kedevsapi.shared.enums.SubscriptionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, UUID> {

    Optional<Subscription> findByUserIdAndTypeAndStatus(UUID userId, SubscriptionType type, SubscriptionStatus status);

    List<Subscription> findByUserIdAndStatus(UUID userId, SubscriptionStatus status);

    List<Subscription> findByEndDateBeforeAndStatus(LocalDateTime date, SubscriptionStatus status);

    List<Subscription> findByEndDateBetweenAndStatus(LocalDateTime from, LocalDateTime to, SubscriptionStatus status);

    boolean existsByUserIdAndTypeAndStatus(UUID userId, SubscriptionType type, SubscriptionStatus status);

    long countByStatus(SubscriptionStatus status);

    long countByTypeAndStatus(SubscriptionType type, SubscriptionStatus status);

    long countByStatusAndEndDateBetween(SubscriptionStatus status, LocalDateTime from, LocalDateTime to);
}
