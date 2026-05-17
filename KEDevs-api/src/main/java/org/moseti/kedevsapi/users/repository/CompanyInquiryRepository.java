package org.moseti.kedevsapi.users.repository;

import org.moseti.kedevsapi.users.entity.CompanyInquiry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.UUID;

@Repository
public interface CompanyInquiryRepository extends JpaRepository<CompanyInquiry, UUID> {

    Page<CompanyInquiry> findByEmployerProfileId(UUID employerProfileId, Pageable pageable);

    long countBySenderUserIdAndCreatedAtAfter(UUID senderUserId, LocalDateTime since);
}
