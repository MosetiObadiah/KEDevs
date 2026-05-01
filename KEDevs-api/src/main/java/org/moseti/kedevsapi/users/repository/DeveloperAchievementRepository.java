package org.moseti.kedevsapi.users.repository;

import org.moseti.kedevsapi.users.entity.DeveloperAchievement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DeveloperAchievementRepository extends JpaRepository<DeveloperAchievement, UUID> {

    List<DeveloperAchievement> findByDeveloperId(UUID developerId);
}
