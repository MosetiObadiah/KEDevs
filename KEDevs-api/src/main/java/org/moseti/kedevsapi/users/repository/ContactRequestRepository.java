package org.moseti.kedevsapi.users.repository;

import org.moseti.kedevsapi.users.entity.ContactRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.UUID;

@Repository
public interface ContactRequestRepository extends JpaRepository<ContactRequest, UUID> {

    Page<ContactRequest> findByDeveloperId(UUID developerId, Pageable pageable);

    long countBySenderUserIdAndCreatedAtAfter(UUID senderUserId, LocalDateTime since);
}
