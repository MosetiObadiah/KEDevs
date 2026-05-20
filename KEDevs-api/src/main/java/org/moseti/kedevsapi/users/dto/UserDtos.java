package org.moseti.kedevsapi.users.dto;

import io.swagger.v3.oas.annotations.media.Schema;
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
            @NotBlank(message = "First name is required") @Schema(description = "Developer's first name", example = "Jane") String firstName,
            @NotBlank(message = "Last name is required") @Schema(description = "Developer's last name", example = "Doe") String lastName,
            @Schema(description = "URL to profile photo", example = "https://example.com/photo.jpg") String profilePhoto,
            @Size(max = 300, message = "Bio cannot exceed 300 characters") @Schema(description = "Short biography", example = "Full-stack developer with a passion for Java.") String bio,
            @Schema(description = "Current or last job title", example = "Senior Software Engineer") String currentLastRole,
            @Schema(description = "Years of professional experience", example = "FIVE_PLUS") YearsOfExperience yearsOfExperience,
            @Schema(description = "Total number of completed projects", example = "12") Integer numberOfProjects,
            @Schema(description = "Current availability status", example = "AVAILABLE_NOW") AvailabilityStatus availabilityStatus,
            @Schema(description = "Preferred work arrangement", example = "REMOTE") WorkType preferredWorkType,
            @Schema(description = "City of residence", example = "Nairobi") String locationCity,
            @Schema(description = "Country of residence", example = "Kenya") String locationCountry,
            @Schema(description = "Who can see the profile", example = "PUBLIC") ProfileVisibility profileVisibility,
            @Schema(description = "LinkedIn profile URL", example = "https://linkedin.com/in/janedoe") String linkedinUrl,
            @Schema(description = "GitHub profile URL", example = "https://github.com/janedoe") String githubUrl,
            @Schema(description = "Portfolio website URL", example = "https://janedoe.dev") String portfolioUrl,
            @Schema(description = "Public contact email", example = "jane.public@example.com") String publicEmail,
            @Schema(description = "Public contact phone", example = "+254712345678") String publicPhone,
            @Schema(description = "Whether employers can contact the developer", example = "true") Boolean canEmployersReachOut,
            @Schema(description = "List of skills", example = "['Java', 'Spring Boot']") java.util.List<String> skills
    ) {}

    public record UpdateDeveloperProfileRequest(
            @Schema(description = "Developer's first name", example = "Jane") String firstName,
            @Schema(description = "Developer's last name", example = "Doe") String lastName,
            @Schema(description = "URL to profile photo", example = "https://example.com/photo.jpg") String profilePhoto,
            @Size(max = 300, message = "Bio cannot exceed 300 characters") @Schema(description = "Short biography", example = "Updated bio.") String bio,
            @Schema(description = "Current or last job title", example = "Lead Developer") String currentLastRole,
            @Schema(description = "Years of professional experience", example = "TEN_PLUS") YearsOfExperience yearsOfExperience,
            @Schema(description = "Total number of completed projects", example = "15") Integer numberOfProjects,
            @Schema(description = "Preferred work arrangement", example = "HYBRID") WorkType preferredWorkType,
            @Schema(description = "City of residence", example = "Mombasa") String locationCity,
            @Schema(description = "Country of residence", example = "Kenya") String locationCountry,
            @Schema(description = "LinkedIn profile URL", example = "https://linkedin.com/in/janedoe") String linkedinUrl,
            @Schema(description = "GitHub profile URL", example = "https://github.com/janedoe") String githubUrl,
            @Schema(description = "Portfolio website URL", example = "https://janedoe.dev") String portfolioUrl,
            @Schema(description = "Public contact email", example = "jane.new@example.com") String publicEmail,
            @Schema(description = "Public contact phone", example = "+254712345679") String publicPhone,
            @Schema(description = "Whether employers can contact the developer", example = "true") Boolean canEmployersReachOut
    ) {}

    public record AddSkillRequest(
            @NotBlank(message = "Skill cannot be blank") @Schema(description = "Name of the skill", example = "Spring Boot") String skill
    ) {}

    public record AddLanguageRequest(
            @NotBlank(message = "Language cannot be blank") @Schema(description = "Language name", example = "Swahili") String language
    ) {}

    public record AddEducationRequest(
            @NotBlank(message = "Institution is required") @Schema(description = "School or University name", example = "University of Nairobi") String institution,
            @NotBlank(message = "Qualification is required") @Schema(description = "Degree or certificate obtained", example = "BSc Computer Science") String qualification,
            @Schema(description = "Field of study", example = "Information Technology") String fieldOfStudy,
            @Schema(description = "Start year", example = "2016") Integer startYear,
            @Schema(description = "Graduation year", example = "2020") Integer yearCompleted,
            @Schema(description = "Is this a certification rather than a degree?", example = "false") Boolean isCertification
    ) {}

    public record AddCertificationRequest(
            @NotBlank(message = "Certification name is required") @Schema(description = "Certification name", example = "AWS Certified Solutions Architect") String name,
            @NotBlank(message = "Issuing body is required") @Schema(description = "Organization that issued it", example = "Amazon Web Services") String issuedBy,
            @Schema(description = "Date of issuance", example = "2023-01-01") java.time.LocalDate issuedDate,
            @Schema(description = "Expiry date", example = "2026-01-01") java.time.LocalDate expiryDate,
            @Schema(description = "Link to the certificate", example = "https://aws.amazon.com/verify/123") String certUrl
    ) {}

    public record AddOssContributionRequest(
            @NotBlank(message = "Project name is required") @Schema(description = "Open source project name", example = "Spring Framework") String projectName,
            @Schema(description = "Role in the project", example = "Contributor") String role,
            @Schema(description = "URL to the contribution (PR/Issue)", example = "https://github.com/spring-projects/spring-framework/pull/123") String contributionUrl,
            @Schema(description = "Brief description of the work", example = "Fixed a bug in WebClient.") String description
    ) {}

    public record AddAchievementRequest(
            @NotBlank(message = "Title is required") @Schema(description = "Achievement title", example = "Hackathon Winner") String title,
            @Schema(description = "Details about the achievement", example = "Won first place at the KeDevs Hackathon 2024.") String description,
            @Schema(description = "URL to the achievement/publication", example = "https://example.com/award") String achievementUrl,
            @Schema(description = "Year received", example = "2024") Integer year
    ) {}

    public record AddProjectRequest(
            @NotBlank(message = "Project title is required") @Schema(description = "Project name", example = "E-Commerce API") String title,
            @Schema(description = "Description of the project", example = "A scalable backend for e-commerce.") String description,
            @Schema(description = "Comma-separated list of technologies used", example = "Java, Spring Boot, PostgreSQL") String techStack,
            @Schema(description = "Live project URL", example = "https://shop.example.com") String projectUrl,
            @Schema(description = "GitHub repository URL", example = "https://github.com/janedoe/shop-api") String repoUrl,
            @Schema(description = "Showcase this project on the main profile?", example = "true") Boolean isFeatured
    ) {}

    public record CreateEndorsementRequest(
            @NotBlank(message = "Content is required")
            @Size(max = 200, message = "Endorsement cannot exceed 200 characters")
            @Schema(description = "Recommendation content", example = "An excellent problem solver and team player.")
            String content
    ) {}

    public record CreateEmployerProfileRequest(
            @NotBlank(message = "Contact person name is required") @Schema(description = "Full name of the point of contact", example = "Alice Smith") String contactPersonName,
            @NotBlank(message = "Company name is required") @Schema(description = "Full legal name of the company", example = "Tech Solutions Ltd") String companyName,
            @Schema(description = "Corporate website", example = "https://techsolutions.com") String companyWebsite,
            @Schema(description = "Primary industry", example = "Software Development") String industry,
            @Schema(description = "Number of employees", example = "TEN_TO_FIFTY") org.moseti.kedevsapi.shared.enums.CompanySize companySize,
            @Schema(description = "Headquarters location", example = "Nairobi, Kenya") String locationHQ,
            @Schema(description = "Brief company background", example = "Leading provider of cloud solutions.") String companyBio,
            @Schema(description = "URL to company logo", example = "https://techsolutions.com/logo.png") String logoUrl,
            @Schema(description = "LinkedIn company page URL", example = "https://linkedin.com/company/techsolutions") String linkedinUrl,
            @Schema(description = "X/Twitter handle or URL", example = "@techsolutions") String twitterUrl,
            @Schema(description = "Direct contact email", example = "hiring@techsolutions.com") String contactEmail
    ) {}

    public record UpdateEmployerProfileRequest(
            @Schema(description = "Full name of the point of contact", example = "Alice Smith") String contactPersonName,
            @Schema(description = "Full legal name of the company", example = "Tech Solutions Ltd") String companyName,
            @Schema(description = "Corporate website", example = "https://techsolutions.com") String companyWebsite,
            @Schema(description = "Primary industry", example = "Cloud Services") String industry,
            @Schema(description = "Number of employees", example = "FIFTY_TO_TWO_HUNDRED") org.moseti.kedevsapi.shared.enums.CompanySize companySize,
            @Schema(description = "Headquarters location", example = "Nairobi, Kenya") String locationHQ,
            @Schema(description = "Brief company background", example = "Updated company bio.") String companyBio,
            @Schema(description = "URL to company logo", example = "https://techsolutions.com/logo.png") String logoUrl,
            @Schema(description = "LinkedIn company page URL", example = "https://linkedin.com/company/techsolutions") String linkedinUrl,
            @Schema(description = "X/Twitter handle or URL", example = "@techsolutions") String twitterUrl,
            @Schema(description = "Contact email address", example = "contact@company.com") String contactEmail
    ) {}

    public record ContactRequestDto(
            @NotBlank(message = "Message is required") @Schema(description = "Personalized message to the developer", example = "We love your profile and would like to chat about an open role.") String message
    ) {}

    public record FlagUserRequest(
            @NotBlank(message = "Reason is required") @Schema(description = "Reason for flagging the user", example = "Spam profile.") String reason
    ) {}

    public record DeveloperFilterRequest(
            @Schema(description = "Filter by current availability") AvailabilityStatus availabilityStatus,
            @Schema(description = "Filter by years of experience") YearsOfExperience yearsOfExperience,
            @Schema(description = "List of required skills") java.util.List<String> skills,
            @Schema(description = "Filter by work arrangement preference") WorkType preferredWorkType,
            @Schema(description = "Filter by city") String locationCity,
            @Schema(description = "Filter by country") String locationCountry,
            @Schema(description = "Filter by education qualification", example = "BSc Computer Science") String educationLevel,
            @Schema(description = "Filter only verified profiles") Boolean isVerified,
            @Schema(description = "List of required spoken languages") java.util.List<String> languages,
            @Schema(description = "Filter by job title keywords", example = "Architect") String currentLastRole
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
            String governmentIdUrl,
            String linkedinUrl,
            String githubUrl,
            String portfolioUrl,
            String publicEmail,
            String publicPhone,
            boolean canEmployersReachOut,
            java.util.List<String> skills,
            java.util.List<String> languages,
            java.util.List<EducationResponse> education,
            java.util.List<CertificationResponse> certifications,
            java.util.List<OssContributionResponse> ossContributions,
            java.util.List<AchievementResponse> achievements,
            java.util.List<DeveloperProjectResponse> projects,
            java.util.List<EndorsementResponse> endorsements,
            int endorsementCount,
            java.time.LocalDateTime createdAt
    ) {}

    public record DeveloperSummaryResponse(
            java.util.UUID id,
            java.util.UUID userId,
            String firstName,
            String lastName,
            String profilePhoto,
            String currentLastRole,
            java.util.List<String> skills,
            AvailabilityStatus availabilityStatus,
            boolean isVerified,
            String locationCity,
            String locationCountry,
            String publicEmail,
            String publicPhone,
            YearsOfExperience yearsOfExperience,
            WorkType preferredWorkType,
            int numberOfProjects,
            int endorsementCount,
            java.util.List<String> languages
    ) {}

    public record EmployerFilterRequest(
            java.util.List<String> industries,
            java.util.List<org.moseti.kedevsapi.shared.enums.CompanySize> sizes,
            String city,
            String country,
            Boolean hasOpenJobs,
            String search
    ) {}

    public record EmployerProfileResponse(
            java.util.UUID id,
            java.util.UUID userId,
            String contactPersonName,
            String contactEmail,
            String companyName,
            String companyWebsite,
            String industry,
            org.moseti.kedevsapi.shared.enums.CompanySize companySize,
            String locationHQ,
            String companyBio,
            String logoUrl,
            String linkedinUrl,
            String twitterUrl,
            String incorporationCertificateUrl,
            String kraPinCertificateUrl,
            String businessPermitUrl,
            boolean isApproved,
            boolean isVerified,
            int openJobsCount,
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
            java.util.List<String> techStack,
            String projectUrl,
            String repoUrl,
            String screenshotUrl,
            boolean isFeatured,
            java.time.LocalDateTime createdAt
    ) {}

    public record ContactRequestResponse(
            java.util.UUID id,
            java.util.UUID senderUserId,
            String senderName,
            java.util.UUID developerId,
            String message,
            org.moseti.kedevsapi.shared.enums.ContactRequestStatus status,
            java.time.LocalDateTime createdAt
    ) {}

    public record CompanyInquiryResponse(
            java.util.UUID id,
            java.util.UUID senderUserId,
            String senderName,
            java.util.UUID employerProfileId,
            String message,
            org.moseti.kedevsapi.shared.enums.ContactRequestStatus status,
            java.time.LocalDateTime createdAt
    ) {}

    // Nested responses used in DeveloperProfileResponse
    public record EducationResponse(
            java.util.UUID id,
            String institution,
            String qualification,
            String fieldOfStudy,
            int startYear,
            int yearCompleted,
            boolean isCertification
    ) {}

    public record CertificationResponse(
            java.util.UUID id,
            String name,
            String issuedBy,
            java.time.LocalDate issuedDate,
            java.time.LocalDate expiryDate,
            String certUrl,
            String certImageUrl
    ) {}

    public record OssContributionResponse(
            java.util.UUID id,
            String projectName,
            String role,
            String contributionUrl,
            String description
    ) {}

    public record AchievementResponse(
            java.util.UUID id,
            String title,
            String description,
            String achievementUrl,
            int year
    ) {}
}
