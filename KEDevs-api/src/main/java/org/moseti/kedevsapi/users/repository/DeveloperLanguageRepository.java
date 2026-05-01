package org.moseti.kedevsapi.users.repository;

import org.moseti.kedevsapi.users.entity.DeveloperLanguage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DeveloperLanguageRepository extends JpaRepository<DeveloperLanguage, UUID> {

    List<DeveloperLanguage> findByDeveloperId(UUID developerId);

    void deleteByDeveloperIdAndLanguageIgnoreCase(UUID developerId, String language);
}
