package org.moseti.kedevsapi.spotlight.repository;

import org.moseti.kedevsapi.shared.enums.SpotlightType;
import org.moseti.kedevsapi.spotlight.entity.SpotlightSlot;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SpotlightSlotRepository extends JpaRepository<SpotlightSlot, UUID> {

    Optional<SpotlightSlot> findByTypeAndIsActiveTrue(SpotlightType type);

    boolean existsByTypeAndIsActiveTrue(SpotlightType type);


    Optional<SpotlightSlot> findByDeveloperIdAndIsActiveTrue(UUID developerId);

    Optional<SpotlightSlot> findByDeveloperIdAndTypeAndIsActiveTrue(UUID developerId, SpotlightType type);

    List<SpotlightSlot> findAllByIsActiveTrueAndEndDateBefore(LocalDateTime date);

    Optional<SpotlightSlot> findByPaymentId(UUID paymentId);

    Page<SpotlightSlot> findAllByIsActiveFalseAndOverriddenByAdminFalseOrderByEndDateDesc(Pageable pageable);

    List<SpotlightSlot> findAllByIsActiveFalseAndOverriddenByAdminFalseOrderByEndDateDesc();
}
