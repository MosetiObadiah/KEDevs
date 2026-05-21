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
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface JobPostRepository extends JpaRepository<JobPost, UUID>, JpaSpecificationExecutor<JobPost> {

    Page<JobPost> findByVisibilityAndStatusOrderByUpvoteCountDescCreatedAtDesc(
            JobVisibility visibility, JobStatus status, Pageable pageable);

    Page<JobPost> findByVisibilityAndStatusAndPostedByIdOrderByUpvoteCountDescCreatedAtDesc(
            JobVisibility visibility, JobStatus status, UUID postedById, Pageable pageable);

    Page<JobPost> findByStatusNotOrderByUpvoteCountDescCreatedAtDesc(
            JobStatus status, Pageable pageable);

    Page<JobPost> findByPostedById(UUID postedById, Pageable pageable);

    @Query("SELECT j FROM JobPost j WHERE j.visibility = :visibility AND j.status = :status " +
           "AND (:postedById IS NULL OR j.postedById = :postedById) " +
           "AND (j.applicationDeadline IS NULL OR j.applicationDeadline >= :today) " +
           "ORDER BY j.upvoteCount DESC, j.createdAt DESC")
    Page<JobPost> findActivePublicJobs(@Param("visibility") JobVisibility visibility,
                                       @Param("status") JobStatus status,
                                       @Param("postedById") UUID postedById,
                                       @Param("today") java.time.LocalDate today,
                                       Pageable pageable);

    @Query("SELECT COUNT(j) FROM JobPost j WHERE j.visibility = :visibility AND j.status = :status " +
           "AND (j.applicationDeadline IS NULL OR j.applicationDeadline >= :today)")
    long countActivePublicJobs(@Param("visibility") JobVisibility visibility,
                               @Param("status") JobStatus status,
                               @Param("today") java.time.LocalDate today);


    @Query("SELECT j FROM JobPost j WHERE " +
           "(CAST(:keyword AS String) IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', CAST(:keyword AS String), '%')) OR LOWER(j.description) LIKE LOWER(CONCAT('%', CAST(:keyword AS String), '%'))) AND " +
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

    long countByPostedByIdAndStatus(UUID postedById, JobStatus status);

    long countByVisibilityAndStatus(JobVisibility visibility, JobStatus status);

    /** Returns currently active pinned jobs (pinnedUntil in the future), most recently pinned first. */
    java.util.List<JobPost> findByIsPinnedTrueAndPinnedUntilAfterOrderByPinnedUntilDesc(
            java.time.LocalDateTime now);

    /** Used by the expiry scheduler via a bulk JPQL update — avoids loading individual entities. */
    @org.springframework.data.jpa.repository.Modifying
    @Query("UPDATE JobPost j SET j.isPinned = false, j.pinnedUntil = null, j.pinnedPaymentId = null " +
           "WHERE j.isPinned = true AND j.pinnedUntil < :now")
    int unpinExpiredJobs(@Param("now") java.time.LocalDateTime now);

    /** Finds expired pinned jobs whose owner needs a notification (isPinned still true, pinnedUntil past). */
    @Query("SELECT j FROM JobPost j WHERE j.isPinned = true AND j.pinnedUntil < :now")
    java.util.List<JobPost> findExpiredPinnedJobs(@Param("now") java.time.LocalDateTime now);

    @Query("SELECT DISTINCT j.minQualification FROM JobPost j WHERE j.minQualification IS NOT NULL AND j.status != 'REMOVED' ORDER BY j.minQualification")
    java.util.List<String> findUniqueQualifications();

    @Query("SELECT DISTINCT j.minExperienceYears FROM JobPost j WHERE j.minExperienceYears IS NOT NULL AND j.status != 'REMOVED' ORDER BY j.minExperienceYears")
    java.util.List<Integer> findUniqueExperienceYears();
}
