package org.moseti.kedevsapi.users.repository;

import org.moseti.kedevsapi.users.entity.EmployerProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmployerProfileRepository extends JpaRepository<EmployerProfile, UUID> {

    Optional<EmployerProfile> findByUserId(UUID userId);

    boolean existsByUserId(UUID userId);

    List<EmployerProfile> findByIsApproved(boolean approved);

    long countByIsApprovedFalse();

    org.springframework.data.domain.Page<EmployerProfile> findByIsApprovedFalse(org.springframework.data.domain.Pageable pageable);

    org.springframework.data.domain.Page<EmployerProfile> findByIsApprovedTrue(org.springframework.data.domain.Pageable pageable);
}
