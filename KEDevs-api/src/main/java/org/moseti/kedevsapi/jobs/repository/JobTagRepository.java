package org.moseti.kedevsapi.jobs.repository;

import org.moseti.kedevsapi.jobs.entity.JobTag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface JobTagRepository extends JpaRepository<JobTag, UUID> {

    List<JobTag> findByJobId(UUID jobId);
    
    List<JobTag> findByTag(String tag);

    @Modifying
    void deleteByJobIdAndTag(UUID jobId, String tag);

    @Query("SELECT DISTINCT t.tag FROM JobTag t")
    Page<String> findDistinctTags(Pageable pageable);
}
