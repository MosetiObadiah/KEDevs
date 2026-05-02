package org.moseti.kedevsapi.payments.repository;

import org.moseti.kedevsapi.payments.entity.UserFlag;
import org.moseti.kedevsapi.shared.enums.UserFlagStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface UserFlagRepository extends JpaRepository<UserFlag, UUID> {

    List<UserFlag> findByFlaggedUserId(UUID userId);

    Page<UserFlag> findByStatus(UserFlagStatus status, Pageable pageable);

    boolean existsByFlaggedUserIdAndFlaggedById(UUID flaggedUserId, UUID flaggedById);

    long countByStatus(UserFlagStatus status);
}
