package org.moseti.kedevsapi.jobs.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.moseti.kedevsapi.shared.enums.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class JobDtos {

    public record CreateJobPostRequest(
            @NotBlank String title,
            String summary,
            @NotBlank String description,
            String companyName,
            String locationCity,
            String locationCountry,
            JobType jobType,
            WorkType workType,
            ExperienceLevel experienceLevel,
            String minQualification,
            Integer minExperienceYears,
            BigDecimal salaryRangeMin,
            BigDecimal salaryRangeMax,
            String salaryCurrency,
            LocalDate applicationDeadline,
            String sourceUrl,
            boolean isPeerSourced,
            @NotNull JobVisibility visibility,
            List<String> tags
    ) {}

    public record UpdateJobPostRequest(
            String title,
            String summary,
            String description,
            String companyName,
            String locationCity,
            String locationCountry,
            JobType jobType,
            WorkType workType,
            ExperienceLevel experienceLevel,
            String minQualification,
            Integer minExperienceYears,
            BigDecimal salaryRangeMin,
            BigDecimal salaryRangeMax,
            String salaryCurrency,
            LocalDate applicationDeadline,
            String sourceUrl,
            Boolean isPeerSourced,
            JobVisibility visibility,
            List<String> tags
    ) {}

    public record JobSearchRequest(
            String keyword,
            String locationCity,
            String locationCountry,
            JobType jobType,
            WorkType workType,
            ExperienceLevel experienceLevel,
            JobStatus status,
            JobVisibility visibility
    ) {}

    public record VoteRequest(
            @NotNull VoteType voteType
    ) {}

    public record FlagJobRequest(
            @NotBlank @Size(max = 500) String reason
    ) {}

    public record ApplyJobRequest(
            @Size(max = 2000) String coverLetter
    ) {}

    public record UpdateApplicationStatusRequest(
            @NotNull ApplicationStatus status
    ) {}

    public record JobPostResponse(
            UUID id,
            UUID postedById,
            String posterName,
            String title,
            String summary,
            String description,
            String companyName,
            String locationCity,
            String locationCountry,
            JobType jobType,
            WorkType workType,
            ExperienceLevel experienceLevel,
            String minQualification,
            Integer minExperienceYears,
            BigDecimal salaryRangeMin,
            BigDecimal salaryRangeMax,
            String salaryCurrency,
            LocalDate applicationDeadline,
            String sourceUrl,
            boolean isPeerSourced,
            JobVisibility visibility,
            JobStatus status,
            int upvoteCount,
            boolean isFlagged,
            List<String> tags,
            LocalDateTime createdAt,
            LocalDateTime updatedAt,
            boolean hasApplied,
            VoteType currentUserVote,
            Integer applicationCount
    ) {}

    public record JobSummaryResponse(
            UUID id,
            String title,
            String companyName,
            String locationCity,
            String locationCountry,
            JobType jobType,
            WorkType workType,
            ExperienceLevel experienceLevel,
            JobVisibility visibility,
            JobStatus status,
            int upvoteCount,
            boolean isPeerSourced,
            String sourceUrl,
            List<String> tags,
            LocalDateTime createdAt
    ) {}

    public record JobApplicationResponse(
            UUID id,
            UUID jobId,
            String jobTitle,
            UUID applicantId,
            String applicantName,
            String coverLetter,
            ApplicationStatus status,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {}

    public record JobFlagResponse(
            UUID id,
            UUID jobId,
            UUID flaggedById,
            String reason,
            FlagStatus status,
            LocalDateTime createdAt
    ) {}
}
