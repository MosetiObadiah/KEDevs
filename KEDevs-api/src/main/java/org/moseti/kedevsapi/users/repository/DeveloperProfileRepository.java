package org.moseti.kedevsapi.users.repository;

import org.moseti.kedevsapi.shared.enums.AvailabilityStatus;
import org.moseti.kedevsapi.shared.enums.ProfileVisibility;
import org.moseti.kedevsapi.users.entity.DeveloperProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface DeveloperProfileRepository extends JpaRepository<DeveloperProfile, UUID> {

    Optional<DeveloperProfile> findByUserId(UUID userId);

    boolean existsByUserId(UUID userId);

    Page<DeveloperProfile> findByProfileVisibility(ProfileVisibility visibility, Pageable pageable);

    Page<DeveloperProfile> findByAvailabilityStatusAndProfileVisibility(
            AvailabilityStatus status,
            ProfileVisibility visibility,
            Pageable pageable
    );
}
