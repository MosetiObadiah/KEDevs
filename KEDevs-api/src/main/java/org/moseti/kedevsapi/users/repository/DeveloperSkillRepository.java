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
    long countByDeveloperId(UUID developerId);

    Optional<DeveloperSkill> findByDeveloperIdAndSkillIgnoreCase(UUID developerId, String skill);

    void deleteByDeveloperIdAndSkillIgnoreCase(UUID developerId, String skill);

    @org.springframework.data.jpa.repository.Query("SELECT ds.skill, COUNT(ds) FROM DeveloperSkill ds GROUP BY ds.skill ORDER BY COUNT(ds) DESC")
    java.util.List<Object[]> findTopSkills(org.springframework.data.domain.Pageable pageable);
}
