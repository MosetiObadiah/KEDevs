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

    boolean existsByUserIdAndTypeAndStatus(UUID userId, SubscriptionType type, SubscriptionStatus status);
}
