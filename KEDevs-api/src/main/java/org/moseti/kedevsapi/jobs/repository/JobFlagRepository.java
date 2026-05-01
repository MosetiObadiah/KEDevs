package org.moseti.kedevsapi.jobs.repository;

import org.moseti.kedevsapi.jobs.entity.JobFlag;
import org.moseti.kedevsapi.shared.enums.FlagStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface JobFlagRepository extends JpaRepository<JobFlag, UUID> {
    List<JobFlag> findByJobId(UUID jobId);
    Page<JobFlag> findByStatus(FlagStatus status, Pageable pageable);
    boolean existsByJobIdAndFlaggedById(UUID jobId, UUID flaggedById);
    int countByJobIdAndStatus(UUID jobId, FlagStatus status);
}
