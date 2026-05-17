package org.moseti.kedevsapi.jobs.repository;

import org.moseti.kedevsapi.jobs.entity.PinnedJobSlot;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PinnedJobSlotRepository extends JpaRepository<PinnedJobSlot, UUID> {

    Optional<PinnedJobSlot> findByPaymentId(UUID paymentId);

    Optional<PinnedJobSlot> findByJobIdAndIsActiveTrue(UUID jobId);

    List<PinnedJobSlot> findAllByIsActiveTrueAndEndDateBefore(LocalDateTime endDate);

    Page<PinnedJobSlot> findAllByIsActiveFalseAndOverriddenByAdminFalseOrderByEndDateDesc(Pageable pageable);

    List<PinnedJobSlot> findAllByIsActiveFalseAndOverriddenByAdminFalseOrderByEndDateDesc();
}
