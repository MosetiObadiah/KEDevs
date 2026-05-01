package org.moseti.kedevsapi.users.repository;

import org.moseti.kedevsapi.users.entity.BookmarkedDeveloper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface BookmarkedDeveloperRepository extends JpaRepository<BookmarkedDeveloper, UUID> {

    Page<BookmarkedDeveloper> findByEmployerId(UUID employerId, Pageable pageable);

    boolean existsByEmployerIdAndDeveloperId(UUID employerId, UUID developerId);

    Optional<BookmarkedDeveloper> findByEmployerIdAndDeveloperId(UUID employerId, UUID developerId);
}
