package org.moseti.kedevsapi.users.repository;

import org.moseti.kedevsapi.users.entity.DeveloperProject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DeveloperProjectRepository extends JpaRepository<DeveloperProject, UUID> {

    List<DeveloperProject> findByDeveloperId(UUID developerId);
    long countByDeveloperId(UUID developerId);

    List<DeveloperProject> findByDeveloperIdAndIsFeatured(UUID developerId, boolean isFeatured);
}
