package org.moseti.kedevsapi.users.repository;

import org.moseti.kedevsapi.users.entity.DeveloperOssContribution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DeveloperOssContributionRepository extends JpaRepository<DeveloperOssContribution, UUID> {

    List<DeveloperOssContribution> findByDeveloperId(UUID developerId);
}
