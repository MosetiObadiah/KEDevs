package org.moseti.kedevsapi.users.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.moseti.kedevsapi.shared.enums.AvailabilityStatus;
import org.moseti.kedevsapi.shared.enums.ProfileVisibility;
import org.moseti.kedevsapi.shared.enums.WorkType;
import org.moseti.kedevsapi.shared.enums.YearsOfExperience;

public class UserDtos {

    // =========================================================
    // REQUEST DTOs
    // =========================================================

    public record CreateDeveloperProfileRequest(
            @NotBlank(message = "First name is required") String firstName,
            @NotBlank(message = "Last name is required") String lastName,
            String profilePhoto,
            @Size(max = 300, message = "Bio cannot exceed 300 characters") String bio,
            String currentLastRole,
            YearsOfExperience yearsOfExperience,
            int numberOfProjects,
            AvailabilityStatus availabilityStatus,
            WorkType preferredWorkType,
            String locationCity,
            String locationCountry,
            ProfileVisibility profileVisibility,
            String linkedinUrl,
            String githubUrl,
            String portfolioUrl,
            String publicEmail,
            String publicPhone
    ) {}

    public record UpdateDeveloperProfileRequest(
            String firstName,
            String lastName,
            String profilePhoto,
            @Size(max = 300, message = "Bio cannot exceed 300 characters") String bio,
            String currentLastRole,
            YearsOfExperience yearsOfExperience,
            int numberOfProjects,
            WorkType preferredWorkType,
            String locationCity,
            String locationCountry,
            String linkedinUrl,
            String githubUrl,
            String portfolioUrl,
            String publicEmail,
            String publicPhone
    ) {}

    public record AddSkillRequest(
            @NotBlank(message = "Skill cannot be blank") String skill
    ) {}

    public record AddLanguageRequest(
            @NotBlank(message = "Language cannot be blank") String language
    ) {}

    public record AddEducationRequest(
            @NotBlank(message = "Institution is required") String institution,
            @NotBlank(message = "Qualification is required") String qualification,
            int yearCompleted,
            boolean isCertification
    ) {}

    public record AddCertificationRequest(
            @NotBlank(message = "Certification name is required") String name,
            @NotBlank(message = "Issuing body is required") String issuedBy,
            int yearIssued,
            String certUrl
    ) {}

    public record AddOssContributionRequest(
            @NotBlank(message = "Project name is required") String projectName,
            String contributionUrl,
            String description
    ) {}

    public record AddAchievementRequest(
            @NotBlank(message = "Title is required") String title,
            String description,
            int year
    ) {}

    public record AddProjectRequest(
            @NotBlank(message = "Project title is required") String title,
            String description,
            String techStack,
            String projectUrl,
            String repoUrl,
            boolean isFeatured
    ) {}

    public record CreateEndorsementRequest(
            @NotBlank(message = "Content is required")
            @Size(max = 200, message = "Endorsement cannot exceed 200 characters")
            String content
    ) {}

    public record CreateEmployerProfileRequest(
            @NotBlank(message = "Contact person name is required") String contactPersonName,
            @NotBlank(message = "Company name is required") String companyName,
            String companyWebsite,
            String industry,
            org.moseti.kedevsapi.shared.enums.CompanySize companySize,
            String locationHQ,
            String companyBio,
            String logoUrl,
            String linkedinUrl,
            String twitterUrl
    ) {}

    public record UpdateEmployerProfileRequest(
            String contactPersonName,
            String companyName,
            String companyWebsite,
            String industry,
            org.moseti.kedevsapi.shared.enums.CompanySize companySize,
            String locationHQ,
            String companyBio,
            String logoUrl,
            String linkedinUrl,
            String twitterUrl
    ) {}

    public record SaveSearchRequest(
            @NotBlank(message = "Search name is required") String searchName,
            java.util.Map<String, Object> filterCriteria
    ) {}

    public record ContactRequestDto(
            @NotBlank(message = "Message is required") String message
    ) {}

    public record DeveloperFilterRequest(
            AvailabilityStatus availabilityStatus,
            YearsOfExperience yearsOfExperience,
            java.util.List<String> skills,
            WorkType preferredWorkType,
            String locationCity,
            String locationCountry,
            String educationLevel,
            Boolean isVerified,
            java.util.List<String> languages,
            String currentLastRole
    ) {}

    // =========================================================
    // RESPONSE DTOs
    // =========================================================

    public record DeveloperProfileResponse(
            java.util.UUID id,
            java.util.UUID userId,
            String firstName,
            String lastName,
            String profilePhoto,
            String bio,
            String currentLastRole,
            YearsOfExperience yearsOfExperience,
            int numberOfProjects,
            AvailabilityStatus availabilityStatus,
            WorkType preferredWorkType,
            String locationCity,
            String locationCountry,
            ProfileVisibility profileVisibility,
            boolean isVerified,
            String linkedinUrl,
            String githubUrl,
            String portfolioUrl,
            String publicEmail,
            String publicPhone,
            java.util.List<String> skills,
            java.util.List<String> languages,
            java.util.List<EducationResponse> education,
            java.util.List<CertificationResponse> certifications,
            java.util.List<OssContributionResponse> ossContributions,
            java.util.List<AchievementResponse> achievements,
            java.util.List<DeveloperProjectResponse> projects,
            java.time.LocalDateTime createdAt
    ) {}

    public record DeveloperSummaryResponse(
            java.util.UUID id,
            String firstName,
            String lastName,
            String profilePhoto,
            String currentLastRole,
            java.util.List<String> skills,
            AvailabilityStatus availabilityStatus,
            boolean isVerified,
            String locationCity,
            String locationCountry
    ) {}

    public record EmployerProfileResponse(
            java.util.UUID id,
            java.util.UUID userId,
            String contactPersonName,
            String companyName,
            String companyWebsite,
            String industry,
            org.moseti.kedevsapi.shared.enums.CompanySize companySize,
            String locationHQ,
            String companyBio,
            String logoUrl,
            String linkedinUrl,
            String twitterUrl,
            boolean isApproved,
            boolean isProAccount,
            java.time.LocalDateTime createdAt
    ) {}

    public record EndorsementResponse(
            java.util.UUID id,
            String content,
            String authorName,
            java.util.UUID authorId,
            java.time.LocalDateTime createdAt
    ) {}

    public record DeveloperProjectResponse(
            java.util.UUID id,
            String title,
            String description,
            String techStack,
            String projectUrl,
            String repoUrl,
            boolean isFeatured,
            java.time.LocalDateTime createdAt
    ) {}

    public record ContactRequestResponse(
            java.util.UUID id,
            java.util.UUID employerId,
            java.util.UUID developerId,
            String message,
            org.moseti.kedevsapi.shared.enums.ContactRequestStatus status,
            java.time.LocalDateTime createdAt
    ) {}

    public record BookmarkResponse(
            java.util.UUID id,
            java.util.UUID developerId,
            String developerName,
            java.time.LocalDateTime bookmarkedAt
    ) {}

    public record SavedSearchResponse(
            java.util.UUID id,
            String searchName,
            String filterCriteria,
            java.time.LocalDateTime createdAt
    ) {}

    // Nested responses used in DeveloperProfileResponse
    public record EducationResponse(
            java.util.UUID id,
            String institution,
            String qualification,
            int yearCompleted,
            boolean isCertification
    ) {}

    public record CertificationResponse(
            java.util.UUID id,
            String name,
            String issuedBy,
            int yearIssued,
            String certUrl
    ) {}

    public record OssContributionResponse(
            java.util.UUID id,
            String projectName,
            String contributionUrl,
            String description
    ) {}

    public record AchievementResponse(
            java.util.UUID id,
            String title,
            String description,
            int year
    ) {}
}
