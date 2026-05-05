package org.moseti.kedevsapi.users.repository;

import org.moseti.kedevsapi.users.entity.Endorsement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface EndorsementRepository extends JpaRepository<Endorsement, UUID> {

    Page<Endorsement> findByRecipientId(UUID recipientId, Pageable pageable);

    boolean existsByAuthorIdAndRecipientId(UUID authorId, UUID recipientId);
}
