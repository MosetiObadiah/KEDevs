package org.moseti.kedevsapi.admin.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.moseti.kedevsapi.shared.enums.AccountStatus;
import org.moseti.kedevsapi.shared.enums.CommentFlagStatus;
import org.moseti.kedevsapi.shared.enums.FlagStatus;
import org.moseti.kedevsapi.shared.enums.Role;
import org.moseti.kedevsapi.shared.enums.UserFlagStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public class AdminDtos {

    // Request DTOs
    public record ApproveEmployerRequest(
            @NotNull @Schema(description = "Whether to approve the employer", example = "true") boolean approved,
            @Schema(description = "Optional notes for the approval/rejection", example = "Company details verified.") String notes
    ) {}

    public record UserActionRequest(
            @NotBlank @Schema(description = "Action to perform on user", allowableValues = {"WARN", "SUSPEND", "BAN", "UNBAN"}, example = "BAN") String action,
            @jakarta.validation.constraints.Size(max = 500) @Schema(description = "Reason for the action", example = "Violation of terms.") String notes
    ) {}

    public record ReviewJobFlagRequest(
            @NotBlank @Schema(description = "Outcome of the review", allowableValues = {"LEGITIMATE", "REMOVED", "REVERT"}, example = "LEGITIMATE") String outcome,
            @NotBlank @Schema(description = "Review notes", example = "The job post is valid and follows guidelines.") String notes
    ) {}

    public record ReviewUserFlagRequest(
            @NotBlank @Schema(description = "Outcome of the review", allowableValues = {"CLEARED", "WARNED", "SUSPENDED", "BANNED", "REVERT"}, example = "WARNED") String outcome,
            @NotBlank @Schema(description = "Review notes", example = "User warned about behavior.") String notes
    ) {}

    public record ReviewCommentFlagRequest(
            @NotBlank @Schema(description = "Outcome of the review", allowableValues = {"KEPT", "REMOVED", "REVERT"}, example = "KEPT") String outcome,
            @NotBlank @Schema(description = "Review notes", example = "Comment does not violate policies.") String notes
    ) {}

    public record BadgeActionRequest(
            @NotBlank @Schema(description = "Action to perform on badge", allowableValues = {"GRANT", "REVOKE"}, example = "GRANT") String action,
            @NotBlank @Schema(description = "Reason for the action", example = "Developer has been verified.") String notes
    ) {}

    public record UpdateSettingRequest(
            @NotBlank @Schema(description = "New value for the setting", example = "5000.00") String settingValue
    ) {}

    public record AdminOverrideSpotlightRequest(
            @NotBlank @Schema(description = "Reason for override", example = "Content is inappropriate.") String reason
    ) {}

    public record VerificationReviewRequest(
            @NotBlank @Schema(description = "Outcome", allowableValues = {"APPROVED", "REJECTED"}, example = "APPROVED") String status,
            @Schema(description = "Reason if rejected", example = "Documents blurry.") String reason
    ) {}

    // Response DTOs
    public record VerificationRequestAdminResponse(
            UUID requestId,
            UUID userId,
            String userName,
            Role role,
            String status,
            String idDocumentUrl,
            String passportPhotoUrl,
            List<String> certificateUrls,
            LocalDateTime createdAt
    ) {}
    public record AdminActionResponse(
            UUID id,
            UUID adminId,
            String adminName,
            String actionType,
            String targetType,
            UUID targetId,
            String notes,
            String outcome,
            LocalDateTime createdAt
    ) {}

    public record UserSummaryResponse(
            UUID id,
            String email,
            String fullName,
            Role role,
            AccountStatus accountStatus,
            boolean isEmailVerified,
            LocalDateTime createdAt,
            String avatarUrl,
            UUID profileId,
            LocalDateTime lastLoginAt,
            org.moseti.kedevsapi.shared.enums.AuthProvider authProvider,
            boolean approvedByAdmin,
            boolean isVerified
    ) {}

    public record PendingEmployerResponse(
            UUID employerProfileId,
            UUID userId,
            String companyName,
            String industry,
            String companySize,
            String locationHQ,
            String contactPersonName,
            String contactEmail,
            LocalDateTime createdAt
    ) {}

    public record FlaggedJobResponse(
            UUID flagId,
            UUID jobId,
            String jobTitle,
            String postedBy,
            String flaggedBy,
            String reason,
            FlagStatus flagStatus,
            LocalDateTime flagCreatedAt,
            int totalFlagsOnJob
    ) {}

    public record FlaggedUserResponse(
            UUID flagId,
            UUID flaggedUserId,
            String flaggedUserEmail,
            Role flaggedUserRole,
            UUID flaggedById,
            String reason,
            UserFlagStatus flagStatus,
            LocalDateTime createdAt
    ) {}

    public record FlaggedCommentResponse(
            UUID flagId,
            UUID commentId,
            String commentContent,
            UUID authorId,
            UUID jobId,
            UUID flaggedById,
            String reason,
            CommentFlagStatus flagStatus,
            LocalDateTime createdAt
    ) {}

    public record RevenueBreakdownResponse(
            BigDecimal totalRevenue,
            Map<String, BigDecimal> byPaymentType,
            BigDecimal revenueThisMonth,
            BigDecimal revenueThisWeek,
            int transactionCount,
            int completedPayments,
            int failedPayments
    ) {}

    public record SignupTrendResponse(
            String date,
            long totalSignups,
            long developerSignups,
            long employerSignups
    ) {}

    public record RevenueTrendResponse(
            String date,
            BigDecimal revenue
    ) {}


    public record ForumActivityResponse(
            long totalComments,
            long commentsToday,
            long commentsThisWeek,
            long hiddenComments,
            long flaggedComments,
            UUID mostActiveJobId,
            String mostActiveJobTitle,
            long mostActiveJobCommentCount
    ) {}

    public record FlaggedContentSummaryResponse(
            long pendingJobFlags,
            long pendingUserFlags,
            long pendingCommentFlags,
            long totalPendingFlags
    ) {}

    public record JobSummaryForAdmin(
            UUID id,
            String title,
            String postedBy,
            String status,
            int upvoteCount,
            int applicationCount,
            LocalDateTime createdAt,
            boolean isFlagged
    ) {}

    public record PlatformSettingResponse(
            String settingKey,
            String settingValue,
            String description,
            UUID updatedByAdminId,
            LocalDateTime updatedAt
    ) {}

    public record AvailabilityBreakdown(
            long openToOffers,
            long notAvailable
    ) {}

    public record MonthlyVerificationStats(
            String month,
            long pending,
            long approved,
            long rejected
    ) {}

    public record ApplicationTrendResponse(
            String date,
            long count
    ) {}

    public record SkillCountResponse(
            String skill,
            long count
    ) {}

    public record RevenueByTypeResponse(
            String month,
            Map<String, java.math.BigDecimal> byType
    ) {}

    public record LocationCountResponse(
            String city,
            long count
    ) {}

    public record AnalyticsExportRequest(
            List<String> charts,
            String dateRange,
            String generatedBy
    ) {}

    public record AnalyticsSummaryResponse(
            long totalUsers,
            long totalDevelopers,
            long totalEmployers,
            long totalAdmins,
            long newUsersToday,
            long newUsersThisWeek,
            long newUsersThisMonth,
            long pendingEmployerApprovals,
            long totalApplications,
            Map<String, Long> jobTypeBreakdown,
            AvailabilityBreakdown availabilityBreakdown,
            List<MonthlyVerificationStats> verificationStats,
            RevenueBreakdownResponse revenue,
            ForumActivityResponse forum,
            FlaggedContentSummaryResponse flaggedContent,
            List<JobSummaryForAdmin> topUpvotedJobs,
            List<AdminActionResponse> recentAdminActions
    ) {}

    public record FlagExportResponse(
            String date,
            String category,
            String content,
            String reason,
            String flaggedBy,
            String status
    ) {}
}
