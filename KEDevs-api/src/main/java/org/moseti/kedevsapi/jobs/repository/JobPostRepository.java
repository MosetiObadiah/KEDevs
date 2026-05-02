package org.moseti.kedevsapi.jobs.repository;

import org.moseti.kedevsapi.jobs.entity.JobPost;
import org.moseti.kedevsapi.shared.enums.ExperienceLevel;
import org.moseti.kedevsapi.shared.enums.JobStatus;
import org.moseti.kedevsapi.shared.enums.JobType;
import org.moseti.kedevsapi.shared.enums.JobVisibility;
import org.moseti.kedevsapi.shared.enums.WorkType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface JobPostRepository extends JpaRepository<JobPost, UUID> {

    Page<JobPost> findByVisibilityAndStatusOrderByUpvoteCountDescCreatedAtDesc(
            JobVisibility visibility, JobStatus status, Pageable pageable);

    Page<JobPost> findByStatusNotOrderByUpvoteCountDescCreatedAtDesc(
            JobStatus status, Pageable pageable);

    Page<JobPost> findByPostedById(UUID postedById, Pageable pageable);

    @Query("SELECT j FROM JobPost j WHERE " +
           "(:keyword IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(j.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "(:locationCity IS NULL OR j.locationCity = :locationCity) AND " +
           "(:locationCountry IS NULL OR j.locationCountry = :locationCountry) AND " +
           "(:jobType IS NULL OR j.jobType = :jobType) AND " +
           "(:workType IS NULL OR j.workType = :workType) AND " +
           "(:experienceLevel IS NULL OR j.experienceLevel = :experienceLevel) AND " +
           "(:status IS NULL OR j.status = :status) AND " +
           "(:visibility IS NULL OR j.visibility = :visibility) AND " +
           "j.status != 'REMOVED' " +
           "ORDER BY j.upvoteCount DESC, j.createdAt DESC")
    Page<JobPost> searchJobs(
            @Param("keyword") String keyword,
            @Param("locationCity") String locationCity,
            @Param("locationCountry") String locationCountry,
            @Param("jobType") JobType jobType,
            @Param("workType") WorkType workType,
            @Param("experienceLevel") ExperienceLevel experienceLevel,
            @Param("status") JobStatus status,
            @Param("visibility") JobVisibility visibility,
            Pageable pageable);

    Page<JobPost> findByStatusNotOrderByUpvoteCountDesc(JobStatus status, Pageable pageable);
}
