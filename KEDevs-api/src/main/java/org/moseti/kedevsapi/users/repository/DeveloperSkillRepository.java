package org.moseti.kedevsapi.users.repository;

import org.moseti.kedevsapi.users.entity.DeveloperSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DeveloperSkillRepository extends JpaRepository<DeveloperSkill, UUID> {

    List<DeveloperSkill> findByDeveloperId(UUID developerId);

    Optional<DeveloperSkill> findByDeveloperIdAndSkillIgnoreCase(UUID developerId, String skill);

    void deleteByDeveloperIdAndSkillIgnoreCase(UUID developerId, String skill);
}
