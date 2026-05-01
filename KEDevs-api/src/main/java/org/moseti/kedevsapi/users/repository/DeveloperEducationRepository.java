package org.moseti.kedevsapi.users.repository;

import org.moseti.kedevsapi.users.entity.DeveloperEducation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DeveloperEducationRepository extends JpaRepository<DeveloperEducation, UUID> {

    List<DeveloperEducation> findByDeveloperId(UUID developerId);
}
