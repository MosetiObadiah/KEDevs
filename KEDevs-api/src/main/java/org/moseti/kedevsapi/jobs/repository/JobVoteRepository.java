package org.moseti.kedevsapi.jobs.repository;

import org.moseti.kedevsapi.jobs.entity.JobVote;
import org.moseti.kedevsapi.shared.enums.VoteType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface JobVoteRepository extends JpaRepository<JobVote, UUID> {
    Optional<JobVote> findByJobIdAndUserId(UUID jobId, UUID userId);
    boolean existsByJobIdAndUserId(UUID jobId, UUID userId);
    int countByJobIdAndVoteType(UUID jobId, VoteType voteType);
}
