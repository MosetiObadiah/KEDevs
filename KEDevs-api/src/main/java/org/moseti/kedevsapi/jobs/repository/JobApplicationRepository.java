package org.moseti.kedevsapi.jobs.repository;

import org.moseti.kedevsapi.jobs.entity.JobApplication;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface JobApplicationRepository extends JpaRepository<JobApplication, UUID> {
    Page<JobApplication> findByJobId(UUID jobId, Pageable pageable);
    Page<JobApplication> findByApplicantId(UUID applicantId, Pageable pageable);
    boolean existsByJobIdAndApplicantId(UUID jobId, UUID applicantId);
    Optional<JobApplication> findByJobIdAndId(UUID jobId, UUID id);
}
