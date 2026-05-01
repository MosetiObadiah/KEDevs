package org.moseti.kedevsapi.payments.repository;

import org.moseti.kedevsapi.payments.entity.PlatformSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PlatformSettingRepository extends JpaRepository<PlatformSetting, UUID> {

    Optional<PlatformSetting> findBySettingKey(String key);

    List<PlatformSetting> findAll();
}
