package org.moseti.kedevsapi.admin.repository;

import org.moseti.kedevsapi.admin.entity.AdminAction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface AdminActionRepository extends JpaRepository<AdminAction, UUID> {
    Page<AdminAction> findByAdminId(UUID adminId, Pageable pageable);
    Page<AdminAction> findByActionType(String actionType, Pageable pageable);
    List<AdminAction> findByTargetTypeAndTargetId(String targetType, UUID targetId);
    long countByActionTypeAndCreatedAtAfter(String actionType, LocalDateTime since);
}
