package org.moseti.kedevsapi.users.repository;

import org.moseti.kedevsapi.users.entity.BlockedUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface BlockedUserRepository extends JpaRepository<BlockedUser, UUID> {
    boolean existsByBlockerIdAndBlockedId(UUID blockerId, UUID blockedId);
    void deleteByBlockerIdAndBlockedId(UUID blockerId, UUID blockedId);
}
