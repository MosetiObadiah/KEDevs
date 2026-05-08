package org.moseti.kedevsapi.jobs.dto;

import io.swagger.v3.oas.annotations.media.Schema;
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
            @NotBlank @Schema(description = "Job title", example = "Senior Java Developer") String title,
            @Schema(description = "Short summary of the role", example = "Join our team to build next-gen finance apps.") String summary,
            @NotBlank @Schema(description = "Full markdown description", example = "## Requirements\n- Java 17\n- Spring Boot") String description,
            @Schema(description = "Hiring company name", example = "Acme Corp") String companyName,
            @Schema(description = "City where the job is located", example = "Nairobi") String locationCity,
            @Schema(description = "Country where the job is located", example = "Kenya") String locationCountry,
            @Schema(description = "Job type", example = "FULL_TIME") JobType jobType,
            @Schema(description = "Work arrangement", example = "REMOTE") WorkType workType,
            @Schema(description = "Required experience level", example = "SENIOR") ExperienceLevel experienceLevel,
            @Schema(description = "Minimum education required", example = "BSc Computer Science") String minQualification,
            @Schema(description = "Minimum years of relevant experience", example = "5") Integer minExperienceYears,
            @Schema(description = "Minimum salary offer", example = "250000.00") BigDecimal salaryRangeMin,
            @Schema(description = "Maximum salary offer", example = "400000.00") BigDecimal salaryRangeMax,
            @Schema(description = "Currency of the salary", example = "KES") String salaryCurrency,
            @Schema(description = "Deadline for applications", example = "2026-12-31") LocalDate applicationDeadline,
            @Schema(description = "URL to external job post (if any)", example = "https://acme.com/jobs/123") String sourceUrl,
            @Schema(description = "Was this job sourced by a community member?", example = "false") boolean isPeerSourced,
            @NotNull @Schema(description = "Who can see this job", example = "PUBLIC") JobVisibility visibility,
            @Schema(description = "List of skills/tags", example = "[\"java\", \"spring-boot\"]") List<String> tags
    ) {}

    public record UpdateJobPostRequest(
            @Schema(description = "Job title", example = "Lead Java Developer") String title,
            @Schema(description = "Short summary of the role") String summary,
            @Schema(description = "Full markdown description") String description,
            @Schema(description = "Hiring company name") String companyName,
            @Schema(description = "City where the job is located") String locationCity,
            @Schema(description = "Country where the job is located") String locationCountry,
            @Schema(description = "Job type") JobType jobType,
            @Schema(description = "Work arrangement") WorkType workType,
            @Schema(description = "Required experience level") ExperienceLevel experienceLevel,
            @Schema(description = "Minimum education required") String minQualification,
            @Schema(description = "Minimum years of relevant experience") Integer minExperienceYears,
            @Schema(description = "Minimum salary offer") BigDecimal salaryRangeMin,
            @Schema(description = "Maximum salary offer") BigDecimal salaryRangeMax,
            @Schema(description = "Currency of the salary") String salaryCurrency,
            @Schema(description = "Deadline for applications") LocalDate applicationDeadline,
            @Schema(description = "URL to external job post") String sourceUrl,
            @Schema(description = "Was this job sourced by a community member?") Boolean isPeerSourced,
            @Schema(description = "Who can see this job") JobVisibility visibility,
            @Schema(description = "List of skills/tags") List<String> tags
    ) {}

    public record JobSearchRequest(
            @Schema(description = "Keyword to search in title/description", example = "Java") String keyword,
            @Schema(description = "Filter by city", example = "Nairobi") String locationCity,
            @Schema(description = "Filter by country", example = "Kenya") String locationCountry,
            @Schema(description = "Filter by job type", example = "FULL_TIME") JobType jobType,
            @Schema(description = "Filter by work arrangement", example = "REMOTE") WorkType workType,
            @Schema(description = "Filter by experience level", example = "SENIOR") ExperienceLevel experienceLevel,
            @Schema(description = "Filter by job status", example = "OPEN") JobStatus status,
            @Schema(description = "Filter by visibility", example = "PUBLIC") JobVisibility visibility
    ) {}

    public record VoteRequest(
            @NotNull @Schema(description = "Type of vote", example = "UPVOTE") VoteType voteType
    ) {}

    public record FlagJobRequest(
            @NotBlank @Size(max = 500) @Schema(description = "Reason for flagging the job", example = "This looks like a scam.") String reason
    ) {}

    public record ApplyJobRequest(
            @Size(max = 2000) @Schema(description = "Optional cover letter for the application", example = "I am very interested in this role because...") String coverLetter
    ) {}

    public record UpdateApplicationStatusRequest(
            @NotNull @Schema(description = "New status of the application", example = "SHORTLISTED") ApplicationStatus status
    ) {}

    public record JobPostResponse(
            UUID id,
            UUID postedById,
            String posterName,
            String contactEmail,
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
            String companyName,
            UUID applicantId,
            String applicantName,
            String applicantEmail,
            String applicantProfileImage,
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
