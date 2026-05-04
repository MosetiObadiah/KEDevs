package org.moseti.kedevsapi.admin.service;

import lombok.RequiredArgsConstructor;
import org.moseti.kedevsapi.admin.dto.AdminDtos.*;
import org.moseti.kedevsapi.admin.entity.AdminAction;
import org.moseti.kedevsapi.admin.entity.AdminActionTypes;
import org.moseti.kedevsapi.admin.exception.CannotActionAdminException;
import org.moseti.kedevsapi.admin.exception.InvalidAdminActionException;
import org.moseti.kedevsapi.admin.exception.SettingNotFoundException;
import org.moseti.kedevsapi.admin.repository.AdminActionRepository;
import org.moseti.kedevsapi.forum.entity.CommentFlag;
import org.moseti.kedevsapi.forum.entity.ForumComment;
import org.moseti.kedevsapi.forum.repository.CommentFlagRepository;
import org.moseti.kedevsapi.forum.repository.ForumCommentRepository;
import org.moseti.kedevsapi.jobs.entity.JobFlag;
import org.moseti.kedevsapi.jobs.entity.JobPost;
import org.moseti.kedevsapi.jobs.repository.JobApplicationRepository;
import org.moseti.kedevsapi.jobs.repository.JobFlagRepository;
import org.moseti.kedevsapi.jobs.repository.JobPostRepository;
import org.moseti.kedevsapi.notifications.service.NotificationService;
import org.moseti.kedevsapi.payments.entity.PlatformSetting;
import org.moseti.kedevsapi.payments.entity.UserFlag;
import org.moseti.kedevsapi.payments.repository.PaymentRepository;
import org.moseti.kedevsapi.payments.repository.PlatformSettingRepository;
import org.moseti.kedevsapi.payments.repository.SubscriptionRepository;
import org.moseti.kedevsapi.payments.repository.UserFlagRepository;
import org.moseti.kedevsapi.shared.enums.*;
import org.moseti.kedevsapi.shared.exception.ResourceNotFoundException;
import org.moseti.kedevsapi.spotlight.service.SpotlightService;
import org.moseti.kedevsapi.users.entity.DeveloperProfile;
import org.moseti.kedevsapi.users.entity.EmployerProfile;
import org.moseti.kedevsapi.users.entity.User;
import org.moseti.kedevsapi.users.repository.DeveloperProfileRepository;
import org.moseti.kedevsapi.users.repository.EmployerProfileRepository;
import org.moseti.kedevsapi.users.repository.UserRepository;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.moseti.kedevsapi.shared.dto.WebSocketEvent;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminService {

    private final AdminActionRepository adminActionRepository;
    private final UserRepository userRepository;
    private final DeveloperProfileRepository developerProfileRepository;
    private final EmployerProfileRepository employerProfileRepository;
    private final JobPostRepository jobPostRepository;
    private final JobFlagRepository jobFlagRepository;
    private final ForumCommentRepository forumCommentRepository;
    private final CommentFlagRepository commentFlagRepository;
    private final UserFlagRepository userFlagRepository;
    private final PaymentRepository paymentRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final PlatformSettingRepository platformSettingRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final SimpMessagingTemplate messagingTemplate;
    
    @Lazy private final NotificationService notificationService;
    @Lazy private final SpotlightService spotlightService;

    // --- User Management ---

    public Page<PendingEmployerResponse> getPendingEmployers(Pageable pageable) {
        return employerProfileRepository.findByIsApprovedFalse(pageable)
                .map(p -> {
                    User user = userRepository.findById(p.getUserId()).orElse(null);
                    return new PendingEmployerResponse(
                        p.getId(), p.getUserId(), p.getCompanyName(), p.getIndustry(),
                        p.getCompanySize() != null ? p.getCompanySize().name() : null,
                        p.getLocationHQ(), p.getContactPersonName(), 
                        user != null ? user.getEmail() : "Unknown",
                        p.getCreatedAt()
                    );
                });
    }

    public void approveEmployer(UUID adminId, UUID employerProfileId, ApproveEmployerRequest request) {
        EmployerProfile profile = employerProfileRepository.findById(employerProfileId)
                .orElseThrow(() -> new ResourceNotFoundException("Employer profile not found"));
        User user = userRepository.findById(profile.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String actionType;
        String outcome;

        if (request.approved()) {
            profile.setApproved(true);
            user.setAccountStatus(AccountStatus.ACTIVE);
            notificationService.notify(user.getId(), NotificationCategory.ADMIN,
                    "Account Approved",
                    "Your employer account has been approved. You can now post jobs.", null);
            actionType = AdminActionTypes.APPROVE_EMPLOYER;
            outcome = "APPROVED";
        } else {
            user.setAccountStatus(AccountStatus.BANNED);
            notificationService.notify(user.getId(), NotificationCategory.ADMIN,
                    "Account Rejected",
                    "Your employer account application was not approved.", null);
            actionType = AdminActionTypes.REJECT_EMPLOYER;
            outcome = "REJECTED";
        }

        userRepository.save(user);
        employerProfileRepository.save(profile);
        logAction(adminId, actionType, "USER", user.getId(), request.notes(), outcome);
        
        // Push status update
        messagingTemplate.convertAndSendToUser(
            user.getId().toString(),
            "/queue/status",
            new WebSocketEvent<>("STATUS_UPDATE", Map.of("accountStatus", user.getAccountStatus(), "isApproved", profile.isApproved()))
        );
    }

    public Page<UserSummaryResponse> getAllUsers(Role role, AccountStatus status, Pageable pageable) {
        if (role != null && status != null) {
            return userRepository.findByRoleAndAccountStatus(role, status, pageable).map(this::toUserSummary);
        } else if (role != null) {
            return userRepository.findByRole(role, pageable).map(this::toUserSummary);
        } else if (status != null) {
            return userRepository.findByAccountStatus(status, pageable).map(this::toUserSummary);
        }
        return userRepository.findAll(pageable).map(this::toUserSummary);
    }

    public UserSummaryResponse getUserById(UUID id) {
        return userRepository.findById(id)
                .map(this::toUserSummary)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public void performUserAction(UUID adminId, UUID targetUserId, UserActionRequest request) {
        User user = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getRole() == Role.ADMIN) {
            throw new CannotActionAdminException("Cannot perform actions on admin accounts");
        }

        String actionType;
        String outcome;
        String notifyTitle;
        String notifyMsg;

        switch (request.action().toUpperCase()) {
            case "SUSPEND" -> {
                user.setAccountStatus(AccountStatus.SUSPENDED);
                actionType = AdminActionTypes.SUSPEND_USER;
                outcome = "SUSPENDED";
                notifyTitle = "Account Suspended";
                notifyMsg = "Your account has been suspended by an administrator. Reason: " + request.notes();
            }
            case "BAN" -> {
                user.setAccountStatus(AccountStatus.BANNED);
                actionType = AdminActionTypes.BAN_USER;
                outcome = "BANNED";
                notifyTitle = "Account Banned";
                notifyMsg = "Your account has been permanently banned. Reason: " + request.notes();
            }
            case "REACTIVATE" -> {
                user.setAccountStatus(AccountStatus.ACTIVE);
                actionType = AdminActionTypes.REACTIVATE_USER;
                outcome = "ACTIVE";
                notifyTitle = "Account Reactivated";
                notifyMsg = "Your account has been reactivated. You can now use the platform.";
            }
            default -> throw new InvalidAdminActionException("Invalid action type. Valid values are: SUSPEND, BAN, REACTIVATE");
        }

        userRepository.save(user);
        logAction(adminId, actionType, "USER", targetUserId, request.notes(), outcome);
        notificationService.notify(targetUserId, NotificationCategory.ADMIN, notifyTitle, notifyMsg, null);

        // Push status update
        messagingTemplate.convertAndSendToUser(
            targetUserId.toString(),
            "/queue/status",
            new WebSocketEvent<>("STATUS_UPDATE", Map.of("accountStatus", user.getAccountStatus()))
        );
    }

    // --- Flagged Content ---

    public Page<FlaggedJobResponse> getFlaggedJobs(FlagStatus status, Pageable pageable) {
        FlagStatus searchStatus = status != null ? status : FlagStatus.PENDING;
        return jobFlagRepository.findByStatus(searchStatus, pageable)
                .map(f -> {
                    JobPost job = jobPostRepository.findById(f.getJobId()).orElse(null);
                    String jobTitle = job != null ? job.getTitle() : "Unknown Job";
                    User poster = job != null ? userRepository.findById(job.getPostedById()).orElse(null) : null;
                    String posterName = poster != null ? poster.getFullName() : "Unknown";
                    User flagger = userRepository.findById(f.getFlaggedById()).orElse(null);
                    String flaggerName = flagger != null ? flagger.getFullName() : "Unknown";
                    int totalFlags = jobFlagRepository.countByJobIdAndStatus(f.getJobId(), FlagStatus.PENDING);
                    return new FlaggedJobResponse(f.getId(), f.getJobId(), jobTitle, posterName, flaggerName,
                            f.getReason(), f.getStatus(), f.getCreatedAt(), totalFlags);
                });
    }

    public void reviewJobFlag(UUID adminId, UUID flagId, ReviewJobFlagRequest request) {
        JobFlag flag = jobFlagRepository.findById(flagId)
                .orElseThrow(() -> new ResourceNotFoundException("Flag not found"));
        JobPost job = jobPostRepository.findById(flag.getJobId())
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        String outcome = request.outcome().toUpperCase();
        if ("LEGITIMATE".equals(outcome)) {
            flag.setStatus(FlagStatus.REVIEWED_LEGITIMATE);
            if (jobFlagRepository.countByJobIdAndStatus(job.getId(), FlagStatus.PENDING) <= 1) {
                job.setFlagged(false);
            }
        } else if ("REMOVE".equals(outcome)) {
            flag.setStatus(FlagStatus.REVIEWED_REMOVED);
            job.setStatus(JobStatus.REMOVED);
            notificationService.notify(job.getPostedById(), NotificationCategory.FLAG,
                    "Job Post Removed",
                    "Your job post '" + job.getTitle() + "' has been removed after review.", null);
        } else if ("WARN".equals(outcome)) {
            flag.setStatus(FlagStatus.REVIEWED_LEGITIMATE);
            notificationService.notify(job.getPostedById(), NotificationCategory.FLAG,
                    "Job Post Warning",
                    "Your job post '" + job.getTitle() + "' has been flagged. Please ensure it follows guidelines.", null);
        } else {
            throw new InvalidAdminActionException("Invalid outcome: " + outcome);
        }

        flag.setReviewedById(adminId);
        flag.setReviewedAt(LocalDateTime.now());
        jobFlagRepository.save(flag);
        jobPostRepository.save(job);
        logAction(adminId, AdminActionTypes.REVIEW_JOB_FLAG, "JOB", job.getId(), request.notes(), outcome);
    }

    public Page<FlaggedUserResponse> getFlaggedUsers(UserFlagStatus status, Pageable pageable) {
        UserFlagStatus searchStatus = status != null ? status : UserFlagStatus.PENDING;
        return userFlagRepository.findByStatus(searchStatus, pageable)
                .map(f -> {
                    User user = userRepository.findById(f.getFlaggedUserId()).orElse(null);
                    return new FlaggedUserResponse(f.getId(), f.getFlaggedUserId(),
                            user != null ? user.getEmail() : "Unknown",
                            user != null ? user.getRole() : null,
                            f.getFlaggedById(), f.getReason(), f.getStatus(), f.getCreatedAt());
                });
    }

    public void reviewUserFlag(UUID adminId, UUID flagId, ReviewUserFlagRequest request) {
        UserFlag flag = userFlagRepository.findById(flagId)
                .orElseThrow(() -> new ResourceNotFoundException("Flag not found"));
        
        String outcome = request.outcome().toUpperCase();
        UserFlagStatus status;
        switch (outcome) {
            case "CLEARED" -> status = UserFlagStatus.REVIEWED_CLEARED;
            case "WARNED" -> status = UserFlagStatus.REVIEWED_WARNED;
            case "SUSPENDED" -> {
                status = UserFlagStatus.REVIEWED_SUSPENDED;
                performUserAction(adminId, flag.getFlaggedUserId(), new UserActionRequest("SUSPEND", request.notes()));
            }
            case "BANNED" -> {
                status = UserFlagStatus.REVIEWED_BANNED;
                performUserAction(adminId, flag.getFlaggedUserId(), new UserActionRequest("BAN", request.notes()));
            }
            default -> throw new InvalidAdminActionException("Invalid outcome: " + outcome);
        }

        flag.setStatus(status);
        flag.setReviewedById(adminId);
        flag.setReviewedAt(LocalDateTime.now());
        userFlagRepository.save(flag);
        logAction(adminId, AdminActionTypes.REVIEW_USER_FLAG, "USER", flag.getFlaggedUserId(), request.notes(), outcome);
    }

    public Page<FlaggedCommentResponse> getFlaggedComments(CommentFlagStatus status, Pageable pageable) {
        CommentFlagStatus searchStatus = status != null ? status : CommentFlagStatus.PENDING;
        return commentFlagRepository.findByStatus(searchStatus, pageable)
                .map(f -> {
                    ForumComment comment = f.getComment();
                    return new FlaggedCommentResponse(f.getId(), comment.getId(),
                            comment != null ? comment.getContent() : "Deleted",
                            comment != null ? comment.getAuthorId() : null,
                            comment != null ? comment.getJobId() : null,
                            f.getFlaggedById(), f.getReason(), f.getStatus(), f.getCreatedAt());
                });
    }

    public void reviewCommentFlag(UUID adminId, UUID flagId, ReviewCommentFlagRequest request) {
        CommentFlag flag = commentFlagRepository.findById(flagId)
                .orElseThrow(() -> new ResourceNotFoundException("Flag not found"));
        ForumComment comment = flag.getComment();

        String outcome = request.outcome().toUpperCase();
        if ("REMOVED".equals(outcome)) {
            comment.setHidden(true);
            flag.setStatus(CommentFlagStatus.REVIEWED_REMOVED);
        } else if ("KEPT".equals(outcome)) {
            flag.setStatus(CommentFlagStatus.REVIEWED_KEPT);
            comment.setFlagged(false);
        }

        flag.setReviewedById(adminId);
        flag.setReviewedAt(LocalDateTime.now());
        commentFlagRepository.save(flag);
        forumCommentRepository.save(comment);
        logAction(adminId, AdminActionTypes.REVIEW_COMMENT_FLAG, "COMMENT", comment.getId(), request.notes(), outcome);
    }

    // --- Badge Management ---

    public void performBadgeAction(UUID adminId, UUID targetUserId, BadgeActionRequest request) {
        User user = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String action = request.action().toUpperCase();
        boolean verified = "GRANT".equals(action);

        if (user.getRole() == Role.DEVELOPER) {
            DeveloperProfile profile = developerProfileRepository.findByUserId(targetUserId)
                    .orElseThrow(() -> new ResourceNotFoundException("Developer profile not found"));
            profile.setVerified(verified);
            developerProfileRepository.save(profile);
        } else if (user.getRole() == Role.EMPLOYER) {
            EmployerProfile profile = employerProfileRepository.findByUserId(targetUserId)
                    .orElseThrow(() -> new ResourceNotFoundException("Employer profile not found"));
            profile.setVerified(verified);
            employerProfileRepository.save(profile);
        }

        String actionType = verified ? AdminActionTypes.GRANT_VERIFIED_BADGE : AdminActionTypes.REVOKE_VERIFIED_BADGE;
        logAction(adminId, actionType, "USER", targetUserId, request.notes(), action);
        notificationService.notify(targetUserId, NotificationCategory.ADMIN,
                verified ? "Verified Badge Granted" : "Verified Badge Revoked",
                verified ? "You have been granted a verified badge." : "Your verified badge has been revoked.", null);

        // Push status update
        messagingTemplate.convertAndSendToUser(
            targetUserId.toString(),
            "/queue/status",
            new WebSocketEvent<>("STATUS_UPDATE", Map.of("isVerified", verified))
        );
    }

    // --- Platform Settings ---

    public List<PlatformSettingResponse> getPlatformSettings() {
        return platformSettingRepository.findAll().stream()
                .map(s -> new PlatformSettingResponse(s.getSettingKey(), s.getSettingValue(), 
                        s.getDescription(), s.getUpdatedByAdminId(), s.getUpdatedAt()))
                .collect(Collectors.toList());
    }

    public PlatformSettingResponse updatePlatformSetting(UUID adminId, String settingKey, UpdateSettingRequest request) {
        PlatformSetting setting = platformSettingRepository.findBySettingKey(settingKey)
                .orElseThrow(() -> new SettingNotFoundException("Setting not found: " + settingKey));

        String oldValue = setting.getSettingValue();
        setting.setSettingValue(request.settingValue());
        setting.setUpdatedByAdminId(adminId);
        platformSettingRepository.save(setting);

        logAction(adminId, AdminActionTypes.UPDATE_PLATFORM_SETTING, "SETTING", setting.getId(),
                "Changed " + settingKey + " from " + oldValue + " to " + request.settingValue(), "UPDATED");

        return new PlatformSettingResponse(setting.getSettingKey(), setting.getSettingValue(),
                setting.getDescription(), setting.getUpdatedByAdminId(), setting.getUpdatedAt());
    }

    public Page<AdminActionResponse> getAdminActionLog(Pageable pageable) {
        return adminActionRepository.findAll(pageable).map(this::toAdminActionResponse);
    }

    // --- Analytics ---

    public AnalyticsSummaryResponse getAnalyticsSummary() {
        RevenueBreakdownResponse revenue = getRevenueBreakdown();
        SubscriptionStatsResponse subscriptions = getSubscriptionStats();
        ForumActivityResponse forum = getForumActivity();
        FlaggedContentSummaryResponse flags = getFlaggedContentSummary();
        
        List<JobSummaryForAdmin> topJobs = jobPostRepository.findByStatusNotOrderByUpvoteCountDesc(JobStatus.REMOVED, PageRequest.of(0, 5))
                .map(j -> new JobSummaryForAdmin(j.getId(), j.getTitle(),
                        userRepository.findById(j.getPostedById()).map(User::getFullName).orElse("Unknown"),
                        j.getStatus().name(), j.getUpvoteCount(),
                        jobApplicationRepository.countByJobId(j.getId()),
                        j.getCreatedAt(), j.isFlagged()))
                .getContent();

        List<AdminActionResponse> recentActions = adminActionRepository.findAll(PageRequest.of(0, 10))
                .map(this::toAdminActionResponse).getContent();

        LocalDateTime startOfToday = LocalDateTime.now().toLocalDate().atStartOfDay();

        return new AnalyticsSummaryResponse(
                userRepository.count(),
                userRepository.countByRole(Role.DEVELOPER),
                userRepository.countByRole(Role.EMPLOYER),
                userRepository.countByRole(Role.ADMIN),
                userRepository.countByCreatedAtAfter(startOfToday),
                userRepository.countByCreatedAtAfter(LocalDateTime.now().minusDays(7)),
                userRepository.countByCreatedAtAfter(LocalDateTime.now().minusDays(30)),
                employerProfileRepository.countByIsApprovedFalse(),
                revenue,
                subscriptions,
                forum,
                flags,
                topJobs,
                recentActions
        );
    }

    public RevenueBreakdownResponse getRevenueBreakdown() {
        BigDecimal total = paymentRepository.getTotalRevenue();
        BigDecimal month = paymentRepository.getRevenueAfter(LocalDateTime.now().minusDays(30));
        BigDecimal week = paymentRepository.getRevenueAfter(LocalDateTime.now().minusDays(7));
        
        Map<String, BigDecimal> byType = new HashMap<>();
        List<Object[]> typeData = paymentRepository.getRevenueByType();
        for (Object[] row : typeData) {
            byType.put(row[0].toString(), (BigDecimal) row[1]);
        }

        return new RevenueBreakdownResponse(
                total, byType, month, week,
                (int) paymentRepository.count(),
                (int) paymentRepository.countByStatus(PaymentStatus.COMPLETED),
                (int) paymentRepository.countByStatus(PaymentStatus.FAILED)
        );
    }

    public List<SignupTrendResponse> getSignupTrends(int days) {
        LocalDateTime since = LocalDateTime.now().minusDays(days);
        List<Object[]> trends = userRepository.findSignupTrends(since);
        return trends.stream()
                .map(row -> new SignupTrendResponse(
                        row[0].toString(),
                        ((Number) row[1]).longValue(),
                        ((Number) row[2]).longValue(),
                        ((Number) row[3]).longValue()
                ))
                .collect(Collectors.toList());
    }

    public SubscriptionStatsResponse getSubscriptionStats() {
        return new SubscriptionStatsResponse(
                subscriptionRepository.countByStatus(SubscriptionStatus.ACTIVE),
                subscriptionRepository.countByStatus(SubscriptionStatus.EXPIRED),
                subscriptionRepository.countByStatus(SubscriptionStatus.CANCELLED),
                subscriptionRepository.countByTypeAndStatus(SubscriptionType.ANNUAL_MEMBERSHIP, SubscriptionStatus.ACTIVE),
                subscriptionRepository.countByTypeAndStatus(SubscriptionType.EMPLOYER_PRO, SubscriptionStatus.ACTIVE),
                subscriptionRepository.countByStatusAndEndDateBetween(SubscriptionStatus.ACTIVE, LocalDateTime.now(), LocalDateTime.now().plusDays(7))
        );
    }

    public ForumActivityResponse getForumActivity() {
        long total = forumCommentRepository.count();
        LocalDateTime startOfToday = LocalDateTime.now().toLocalDate().atStartOfDay();
        
        UUID activeJobId = null;
        String activeJobTitle = null;
        long activeCount = 0;
        
        List<Object[]> activeJobData = forumCommentRepository.findMostActiveJob(PageRequest.of(0, 1));
        if (!activeJobData.isEmpty()) {
            activeJobId = (UUID) activeJobData.get(0)[0];
            activeCount = ((Number) activeJobData.get(0)[1]).longValue();
            activeJobTitle = jobPostRepository.findById(activeJobId).map(JobPost::getTitle).orElse("Unknown");
        }

        return new ForumActivityResponse(
                total,
                forumCommentRepository.countByCreatedAtAfter(startOfToday),
                forumCommentRepository.countByCreatedAtAfter(LocalDateTime.now().minusDays(7)),
                forumCommentRepository.countByIsHiddenTrue(),
                forumCommentRepository.countByIsFlaggedTrue(),
                activeJobId, activeJobTitle, activeCount
        );
    }

    public FlaggedContentSummaryResponse getFlaggedContentSummary() {
        long jobs = jobFlagRepository.countByStatus(FlagStatus.PENDING);
        long users = userFlagRepository.countByStatus(UserFlagStatus.PENDING);
        long comments = commentFlagRepository.countByStatus(CommentFlagStatus.PENDING);
        return new FlaggedContentSummaryResponse(jobs, users, comments, jobs + users + comments);
    }

    // --- Private Helpers ---

    private void logAction(UUID adminId, String actionType, String targetType, UUID targetId, String notes, String outcome) {
        AdminAction action = new AdminAction();
        action.setAdminId(adminId);
        action.setActionType(actionType);
        action.setTargetType(targetType);
        action.setTargetId(targetId);
        action.setNotes(notes);
        action.setOutcome(outcome);
        adminActionRepository.save(action);
    }

    private UserSummaryResponse toUserSummary(User u) {
        return new UserSummaryResponse(u.getId(), u.getEmail(), u.getFullName(), u.getRole(),
                u.getAccountStatus(), u.isEmailVerified(), u.getCreatedAt(),
                u.getSubscriptionExpiresAt(), u.getGracePeriodEndsAt());
    }

    private AdminActionResponse toAdminActionResponse(AdminAction a) {
        return new AdminActionResponse(a.getId(), a.getAdminId(), a.getActionType(),
                a.getTargetType(), a.getTargetId(), a.getNotes(), a.getOutcome(), a.getCreatedAt());
    }
}
