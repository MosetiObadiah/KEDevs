package org.moseti.kedevsapi.users.repository;

import org.moseti.kedevsapi.users.entity.DeveloperCertification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DeveloperCertificationRepository extends JpaRepository<DeveloperCertification, UUID> {

    List<DeveloperCertification> findByDeveloperId(UUID developerId);
}
