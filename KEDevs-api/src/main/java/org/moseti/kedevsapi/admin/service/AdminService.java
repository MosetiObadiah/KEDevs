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
import org.moseti.kedevsapi.jobs.entity.JobApplication;
import org.moseti.kedevsapi.payments.entity.Payment;
import org.moseti.kedevsapi.jobs.repository.JobApplicationRepository;
import org.moseti.kedevsapi.jobs.repository.JobFlagRepository;
import org.moseti.kedevsapi.jobs.repository.JobPostRepository;
import org.moseti.kedevsapi.notifications.service.NotificationService;
import org.moseti.kedevsapi.payments.entity.PlatformSetting;
import org.moseti.kedevsapi.payments.entity.UserFlag;
import org.moseti.kedevsapi.payments.repository.PaymentRepository;
import org.moseti.kedevsapi.payments.repository.PlatformSettingRepository;
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
import org.moseti.kedevsapi.users.repository.VerificationRequestRepository;
import org.moseti.kedevsapi.users.repository.DeveloperSkillRepository;
import org.moseti.kedevsapi.users.entity.VerificationRequest;
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
    private final PlatformSettingRepository platformSettingRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final VerificationRequestRepository verificationRequestRepository;
    private final DeveloperSkillRepository developerSkillRepository;
    private final SimpMessagingTemplate messagingTemplate;
    
    @Lazy private final NotificationService notificationService;
    @Lazy private final SpotlightService spotlightService;
    private final org.moseti.kedevsapi.users.service.CsvExportService csvExportService;
    private final org.moseti.kedevsapi.users.service.PdfExportService pdfExportService;

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

    // --- Verification Requests Queue ---

    @Transactional(readOnly = true)
    public Page<VerificationRequestAdminResponse> getPendingVerificationRequests(Role role, Pageable pageable) {
        List<VerificationRequestAdminResponse> combined = new java.util.ArrayList<>();

        // 1. Always fetch Developers (unless strictly filtering for Employer)
        if (role == null || role == Role.DEVELOPER) {
            List<VerificationRequest> requests = role != null 
                ? verificationRequestRepository.findByRoleAndStatus(role, VerificationStatus.UNDER_REVIEW, Pageable.unpaged()).getContent()
                : verificationRequestRepository.findByStatus(VerificationStatus.UNDER_REVIEW, Pageable.unpaged()).getContent();
            
            combined.addAll(requests.stream().map(r -> {
                String name = userRepository.findById(r.getUserId()).map(User::getFullName).orElse("Unknown");
                return new VerificationRequestAdminResponse(
                        r.getId(), r.getUserId(), name, r.getRole(),
                        r.getStatus().name(), r.getIdDocumentUrl(), r.getPassportPhotoUrl(),
                        r.getCertificateUrls() != null ? new java.util.ArrayList<>(r.getCertificateUrls()) : new java.util.ArrayList<>(),
                        r.getCreatedAt()
                );
            }).toList());
        }

        // 2. Always fetch Employers (unless strictly filtering for Developer)
        if (role == null || role == Role.EMPLOYER) {
            List<VerificationRequestAdminResponse> employers = employerProfileRepository.findByIsApprovedFalse(Pageable.unpaged()).stream()
                .filter(p -> {
                    User user = userRepository.findById(p.getUserId()).orElse(null);
                    // Only show employers who are still in PENDING status (not yet approved/rejected/banned)
                    return user != null && user.getAccountStatus() == AccountStatus.PENDING_APPROVAL;
                })
                .map(p -> {
                    List<String> certs = new java.util.ArrayList<>();
                    if (p.getBusinessPermitUrl() != null) certs.add(p.getBusinessPermitUrl());
                    return new VerificationRequestAdminResponse(
                            p.getId(), p.getUserId(), p.getCompanyName(), Role.EMPLOYER, "PENDING_APPROVAL",
                            p.getIncorporationCertificateUrl(), p.getKraPinCertificateUrl(), certs, p.getCreatedAt()
                    );
                }).toList();
            combined.addAll(employers);
        }

        // 3. Sort aggregated results by created date descending
        combined.sort((a, b) -> b.createdAt().compareTo(a.createdAt()));

        // 4. Construct paginated response
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), combined.size());
        if (start > combined.size()) return new org.springframework.data.domain.PageImpl<>(new java.util.ArrayList<>(), pageable, combined.size());
        return new org.springframework.data.domain.PageImpl<>(combined.subList(start, end), pageable, combined.size());
    }

    @Transactional(readOnly = true)
    public Page<VerificationRequestAdminResponse> getVerificationHistory(Pageable pageable) {
        List<VerificationRequestAdminResponse> combined = getAllUnifiedVerificationHistory();
        
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), combined.size());
        
        if (start > combined.size()) {
            return new org.springframework.data.domain.PageImpl<>(new java.util.ArrayList<>(), pageable, combined.size());
        }
        
        return new org.springframework.data.domain.PageImpl<>(combined.subList(start, end), pageable, combined.size());
    }

    @Transactional(readOnly = true)
    public byte[] generateVerificationExport(String format) {
        List<VerificationRequestAdminResponse> allRequests = getAllUnifiedVerificationHistory();

        if ("csv".equalsIgnoreCase(format)) {
            return csvExportService.generateVerificationCsv(allRequests);
        } else if ("pdf".equalsIgnoreCase(format)) {
            return pdfExportService.generateVerificationPdf(allRequests);
        }
        throw new IllegalArgumentException("Unsupported format");
    }

    private List<VerificationRequestAdminResponse> getAllUnifiedVerificationHistory() {
        // 1. Get ALL developers verification records
        List<VerificationRequestAdminResponse> devHistory = verificationRequestRepository.findAll().stream().map(r -> {
            String name = userRepository.findById(r.getUserId()).map(User::getFullName).orElse("Unknown");
            return new VerificationRequestAdminResponse(
                    r.getId(), r.getUserId(), name, r.getRole(),
                    r.getStatus().name(), r.getIdDocumentUrl(), r.getPassportPhotoUrl(),
                    r.getCertificateUrls() != null ? new java.util.ArrayList<>(r.getCertificateUrls()) : new java.util.ArrayList<>(),
                    r.getCreatedAt()
            );
        }).collect(Collectors.toList());

        // 2. Get ALL approved employer records (onboarded)
        List<VerificationRequestAdminResponse> empHistory = employerProfileRepository.findByIsApprovedTrue(Pageable.unpaged()).stream().map(p -> {
            String name = p.getCompanyName();
            java.util.ArrayList<String> certs = new java.util.ArrayList<>();
            if (p.getBusinessPermitUrl() != null) certs.add(p.getBusinessPermitUrl());
            
            return new VerificationRequestAdminResponse(
                    p.getId(), // using profile ID as proxy ID
                    p.getUserId(),
                    name,
                    Role.EMPLOYER,
                    "APPROVED", // explicitly marked in history
                    p.getIncorporationCertificateUrl(),
                    p.getKraPinCertificateUrl(),
                    certs,
                    p.getCreatedAt()
            );
        }).collect(Collectors.toList());

        // 3. Merge & Sort by date descending
        List<VerificationRequestAdminResponse> combined = new java.util.ArrayList<>();
        combined.addAll(devHistory);
        combined.addAll(empHistory);
        combined.sort((a, b) -> b.createdAt().compareTo(a.createdAt()));
        
        return combined;
    }

    @Transactional
    public void reviewVerificationRequest(UUID adminId, UUID requestId, VerificationReviewRequest request) {
        // Polymorphic Fallback: Try VerificationRequest first, then EmployerProfile.
        var possibleVr = verificationRequestRepository.findById(requestId);
        
        if (possibleVr.isEmpty()) {
            var possibleEmp = employerProfileRepository.findById(requestId);
            if (possibleEmp.isPresent()) {
                boolean approved = "APPROVED".equalsIgnoreCase(request.status());
                approveEmployer(adminId, requestId, new ApproveEmployerRequest(approved, request.reason()));
                return;
            }
            throw new ResourceNotFoundException("Verification request or profile not found for processing");
        }

        VerificationRequest vr = possibleVr.get();
        VerificationStatus oldStatus = vr.getStatus();

        boolean approved = "APPROVED".equalsIgnoreCase(request.status());
        vr.setStatus(approved ? VerificationStatus.APPROVED : VerificationStatus.REJECTED);
        vr.setReviewedById(adminId);
        vr.setReviewedAt(LocalDateTime.now());
        vr.setRejectionReason(request.reason());
        verificationRequestRepository.save(vr);

        User user = userRepository.findById(vr.getUserId()).orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (approved) {
            // Reuse badge perform method logic
            performBadgeAction(adminId, vr.getUserId(), new BadgeActionRequest("GRANT", "Verified via document review"));
            
            if (oldStatus == VerificationStatus.REJECTED) {
                notificationService.notify(vr.getUserId(), NotificationCategory.ADMIN,
                        "Account Re-reviewed",
                        "The administration has re-reviewed your documents and your account has been verified.", null);
            }
            
            logAction(adminId, AdminActionTypes.APPROVE_VERIFICATION, "VERIFICATION", vr.getId(), request.reason(), "APPROVED");
        } else {
            // If it was previously approved, we must revoke the badge
            if (oldStatus == VerificationStatus.APPROVED) {
                performBadgeAction(adminId, vr.getUserId(), new BadgeActionRequest("REVOKE", "Verification decision reverted: " + request.reason()));
            }
            
            logAction(adminId, AdminActionTypes.REJECT_VERIFICATION, "VERIFICATION", vr.getId(), request.reason(), "REJECTED");
            notificationService.notify(vr.getUserId(), NotificationCategory.ADMIN, 
                    "Verification Denied", 
                    "Your identity documents were not accepted. Reason: " + request.reason(), null);
        }
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

        String notesStr = request.notes() != null && !request.notes().isBlank() ? request.notes() : "No reason specified";

        switch (request.action().toUpperCase()) {
            case "WARN" -> {
                actionType = AdminActionTypes.WARN_USER;
                outcome = "WARNED";
                notifyTitle = "Administrative Warning";
                notifyMsg = "Your account has received an administrative warning. Details: " + notesStr;
            }
            case "SUSPEND" -> {
                user.setAccountStatus(AccountStatus.SUSPENDED);
                actionType = AdminActionTypes.SUSPEND_USER;
                outcome = "SUSPENDED";
                notifyTitle = "Account Suspended";
                notifyMsg = "Your account has been suspended by an administrator. Reason: " + notesStr;
            }
            case "BAN" -> {
                user.setAccountStatus(AccountStatus.BANNED);
                actionType = AdminActionTypes.BAN_USER;
                outcome = "BANNED";
                notifyTitle = "Account Banned";
                notifyMsg = "Your account has been permanently banned. Reason: " + notesStr;
            }
            case "REACTIVATE" -> {
                user.setAccountStatus(AccountStatus.ACTIVE);
                actionType = AdminActionTypes.REACTIVATE_USER;
                outcome = "ACTIVE";
                notifyTitle = "Account Reactivated";
                notifyMsg = "Your account has been reactivated. You can now use the platform.";
            }
            default -> throw new InvalidAdminActionException("Invalid action type. Valid values are: WARN, SUSPEND, BAN, REACTIVATE");
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

    public Page<FlaggedJobResponse> getFlaggedJobs(FlagStatus status, boolean history, Pageable pageable) {
        Page<JobFlag> flagPage;
        if (history) {
            flagPage = jobFlagRepository.findByStatusNot(FlagStatus.PENDING, pageable);
        } else {
            FlagStatus searchStatus = status != null ? status : FlagStatus.PENDING;
            flagPage = jobFlagRepository.findByStatus(searchStatus, pageable);
        }
        return flagPage
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
            flag.setStatus(FlagStatus.REVIEWED_KEPT);
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
            flag.setStatus(FlagStatus.REVIEWED_KEPT);
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

        // Notify reporter
        String reporterMsg = "REMOVE".equals(outcome) || "WARN".equals(outcome) || "LEGITIMATE".equals(outcome)
                ? "Your report against job \"" + job.getTitle() + "\" has been resolved. Action was taken."
                : "Your report against job \"" + job.getTitle() + "\" was reviewed and cleared.";
        notificationService.notify(flag.getFlaggedById(), NotificationCategory.FLAG,
                "Report Resolution", reporterMsg, null);
        logAction(adminId, AdminActionTypes.REVIEW_JOB_FLAG, "JOB", job.getId(), request.notes(), outcome);
    }

    public Page<FlaggedUserResponse> getFlaggedUsers(UserFlagStatus status, boolean history, Pageable pageable) {
        Page<UserFlag> flagPage;
        if (history) {
            flagPage = userFlagRepository.findByStatusNot(UserFlagStatus.PENDING, pageable);
        } else {
            UserFlagStatus searchStatus = status != null ? status : UserFlagStatus.PENDING;
            flagPage = userFlagRepository.findByStatus(searchStatus, pageable);
        }
        return flagPage
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

        // Notify reporter
        String reporterMsg = "SUSPENDED".equals(outcome) || "BANNED".equals(outcome) || "WARNED".equals(outcome)
                ? "Your user profile report has been reviewed. Corrective measures have been applied."
                : "Your user profile report was reviewed and cleared.";
        notificationService.notify(flag.getFlaggedById(), NotificationCategory.FLAG,
                "Report Resolution", reporterMsg, null);
        logAction(adminId, AdminActionTypes.REVIEW_USER_FLAG, "USER", flag.getFlaggedUserId(), request.notes(), outcome);
    }

    public Page<FlaggedCommentResponse> getFlaggedComments(CommentFlagStatus status, boolean history, Pageable pageable) {
        Page<CommentFlag> flagPage;
        if (history) {
            flagPage = commentFlagRepository.findByStatusNot(CommentFlagStatus.PENDING, pageable);
        } else {
            CommentFlagStatus searchStatus = status != null ? status : CommentFlagStatus.PENDING;
            flagPage = commentFlagRepository.findByStatus(searchStatus, pageable);
        }
        return flagPage
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

        // Notify reporter
        String reporterMsg = "REMOVED".equals(outcome)
                ? "Your comment report has been reviewed and the content was removed."
                : "Your comment report was reviewed and the content was retained.";
        notificationService.notify(flag.getFlaggedById(), NotificationCategory.FLAG,
                "Report Resolution", reporterMsg, null);
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

    public Page<AdminActionResponse> getFilteredActionLog(String actionType, UUID actorId, Pageable pageable) {
        if (actionType != null && actorId != null) {
            // Compose: filter by both — fetch by actor then filter in memory (table is small)
            return adminActionRepository.findByAdminId(actorId, pageable)
                    .map(this::toAdminActionResponse)
                    .map(r -> actionType.equalsIgnoreCase(r.actionType()) ? r : null);
        } else if (actionType != null) {
            return adminActionRepository.findByActionType(actionType, pageable).map(this::toAdminActionResponse);
        } else if (actorId != null) {
            return adminActionRepository.findByAdminId(actorId, pageable).map(this::toAdminActionResponse);
        }
        return adminActionRepository.findAll(pageable).map(this::toAdminActionResponse);
    }

    // --- Analytics ---

    public AnalyticsSummaryResponse getAnalyticsSummary() {
        RevenueBreakdownResponse revenue = getRevenueBreakdown();
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

        // 1. Total applications
        long totalApplications = jobApplicationRepository.count();

        // 2. Job type & work type breakdown
        Map<String, Long> jobTypeBreakdown = new HashMap<>();
        List<JobPost> allJobs = jobPostRepository.findAll();
        for (JobPost j : allJobs) {
            if (j.getStatus() != JobStatus.REMOVED) {
                if (j.getJobType() != null) {
                    String jt = j.getJobType().name();
                    jobTypeBreakdown.put(jt, jobTypeBreakdown.getOrDefault(jt, 0L) + 1);
                }
                if (j.getWorkType() != null) {
                    String wt = j.getWorkType().name();
                    jobTypeBreakdown.put(wt, jobTypeBreakdown.getOrDefault(wt, 0L) + 1);
                }
            }
        }

        // 3. Availability breakdown
        long openToOffers = developerProfileRepository.countByAvailabilityStatus(AvailabilityStatus.OPEN_TO_OFFERS);
        long notAvailable = developerProfileRepository.countByAvailabilityStatus(AvailabilityStatus.NOT_AVAILABLE);
        AvailabilityBreakdown availabilityBreakdown = new AvailabilityBreakdown(openToOffers, notAvailable);

        // 4. Verification stats over the last 6 months
        LocalDateTime since = LocalDateTime.now().minusMonths(6);
        List<VerificationRequest> requests = verificationRequestRepository.findByCreatedAtAfter(since);
        Map<String, Map<VerificationStatus, Long>> groupedReqs = requests.stream()
                .collect(Collectors.groupingBy(
                        r -> r.getCreatedAt().format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM")),
                        Collectors.groupingBy(
                                VerificationRequest::getStatus,
                                Collectors.counting()
                        )
                ));
                
        List<MonthlyVerificationStats> verificationStats = new java.util.ArrayList<>();
        java.time.LocalDate today = java.time.LocalDate.now();
        java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("yyyy-MM");
        for (int i = 5; i >= 0; i--) {
            java.time.LocalDate d = today.minusMonths(i);
            String monthStr = d.format(formatter);
            Map<VerificationStatus, Long> counts = groupedReqs.getOrDefault(monthStr, new java.util.HashMap<>());
            verificationStats.add(new MonthlyVerificationStats(
                    monthStr,
                    counts.getOrDefault(VerificationStatus.UNDER_REVIEW, 0L),
                    counts.getOrDefault(VerificationStatus.APPROVED, 0L),
                    counts.getOrDefault(VerificationStatus.REJECTED, 0L)
            ));
        }

        return new AnalyticsSummaryResponse(
                userRepository.count(),
                userRepository.countByRole(Role.DEVELOPER),
                userRepository.countByRole(Role.EMPLOYER),
                userRepository.countByRole(Role.ADMIN),
                userRepository.countByCreatedAtAfter(startOfToday),
                userRepository.countByCreatedAtAfter(LocalDateTime.now().minusDays(7)),
                userRepository.countByCreatedAtAfter(LocalDateTime.now().minusDays(30)),
                employerProfileRepository.countByIsApprovedFalse(),
                totalApplications,
                jobTypeBreakdown,
                availabilityBreakdown,
                verificationStats,
                revenue,
                forum,
                flags,
                topJobs,
                recentActions
        );
    }

    public List<ApplicationTrendResponse> getApplicationsOverTime() {
        LocalDateTime since = LocalDateTime.now().minusDays(30);
        List<JobApplication> apps = jobApplicationRepository.findByCreatedAtAfter(since);
        
        Map<java.time.LocalDate, Long> countsByDate = apps.stream()
                .collect(Collectors.groupingBy(
                        a -> a.getCreatedAt().toLocalDate(),
                        Collectors.counting()
                ));
                
        List<ApplicationTrendResponse> result = new java.util.ArrayList<>();
        java.time.LocalDate today = java.time.LocalDate.now();
        java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd");
        for (int i = 29; i >= 0; i--) {
            java.time.LocalDate d = today.minusDays(i);
            long count = countsByDate.getOrDefault(d, 0L);
            result.add(new ApplicationTrendResponse(d.format(formatter), count));
        }
        return result;
    }

    public List<SkillCountResponse> getTopSkills() {
        return developerSkillRepository.findTopSkills(PageRequest.of(0, 10)).stream()
                .map(row -> new SkillCountResponse(row[0].toString(), ((Number) row[1]).longValue()))
                .collect(Collectors.toList());
    }

    public List<RevenueByTypeResponse> getRevenueByType() {
        LocalDateTime since = LocalDateTime.now().minusMonths(12);
        List<Payment> completedPayments = paymentRepository.findByStatusAndCreatedAtAfter(PaymentStatus.COMPLETED, since);
        
        Map<String, Map<String, BigDecimal>> grouped = completedPayments.stream()
                .collect(Collectors.groupingBy(
                        p -> p.getCreatedAt().format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM")),
                        Collectors.groupingBy(
                                p -> p.getType().name(),
                                Collectors.reducing(
                                        BigDecimal.ZERO,
                                        Payment::getAmount,
                                        BigDecimal::add
                                )
                        )
                ));
                
        List<RevenueByTypeResponse> result = new java.util.ArrayList<>();
        java.time.LocalDate today = java.time.LocalDate.now();
        java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("yyyy-MM");
        for (int i = 11; i >= 0; i--) {
            java.time.LocalDate d = today.minusMonths(i);
            String monthStr = d.format(formatter);
            Map<String, BigDecimal> byType = grouped.getOrDefault(monthStr, new java.util.HashMap<>());
            result.add(new RevenueByTypeResponse(monthStr, byType));
        }
        return result;
    }

    public List<LocationCountResponse> getDeveloperLocations() {
        List<DeveloperProfile> profiles = developerProfileRepository.findAll();
        Map<String, Long> cityCounts = new java.util.HashMap<>();
        for (DeveloperProfile p : profiles) {
            String city = p.getLocationCity();
            if (city != null && !city.isBlank()) {
                String normalized = city.trim();
                cityCounts.put(normalized, cityCounts.getOrDefault(normalized, 0L) + 1);
            }
        }
        return cityCounts.entrySet().stream()
                .map(e -> new LocationCountResponse(e.getKey(), e.getValue()))
                .sorted((a, b) -> Long.compare(b.count(), a.count()))
                .limit(10)
                .collect(Collectors.toList());
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

    public List<RevenueTrendResponse> getRevenueTrends(int days) {
        LocalDateTime since = LocalDateTime.now().minusDays(days);
        List<Object[]> trends = paymentRepository.getRevenueTrends(since);
        return trends.stream()
                .map(row -> new RevenueTrendResponse(
                        row[0].toString(),
                        (BigDecimal) row[1]
                ))
                .collect(Collectors.toList());
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
        String avatarUrl = null;
        UUID profileId = null;
        boolean isVerified = false;

        if (u.getRole() == Role.DEVELOPER) {
            var profileOpt = developerProfileRepository.findByUserId(u.getId());
            if (profileOpt.isPresent()) {
                avatarUrl = profileOpt.get().getProfilePhoto();
                profileId = profileOpt.get().getId();
                isVerified = profileOpt.get().isVerified();
            }
        } else if (u.getRole() == Role.EMPLOYER) {
            var profileOpt = employerProfileRepository.findByUserId(u.getId());
            if (profileOpt.isPresent()) {
                avatarUrl = profileOpt.get().getLogoUrl();
                profileId = profileOpt.get().getId();
                isVerified = profileOpt.get().isVerified();
            }
        }

        return new UserSummaryResponse(u.getId(), u.getEmail(), u.getFullName(), u.getRole(),
                u.getAccountStatus(), u.isEmailVerified(), u.getCreatedAt(),
                avatarUrl, profileId, u.getLastLoginAt(), u.getAuthProvider(), u.isApprovedByAdmin(), isVerified);
    }

    private AdminActionResponse toAdminActionResponse(AdminAction a) {
        String adminName = userRepository.findById(a.getAdminId())
                .map(User::getFullName)
                .orElse("Unknown Admin");
        return new AdminActionResponse(a.getId(), a.getAdminId(), adminName, a.getActionType(),
                a.getTargetType(), a.getTargetId(), a.getNotes(), a.getOutcome(), a.getCreatedAt());
    }

    public byte[] generateAnalyticsReportPdf(AnalyticsExportRequest request) {
        List<org.moseti.kedevsapi.users.service.PdfExportService.ExportChartData> exportCharts = new java.util.ArrayList<>();
        
        for (String chartId : request.charts()) {
            if ("applications-over-time".equalsIgnoreCase(chartId)) {
                List<ApplicationTrendResponse> data = getApplicationsOverTime();
                List<List<String>> rows = data.stream()
                        .map(item -> List.of(item.date(), String.valueOf(item.count())))
                        .collect(Collectors.toList());
                exportCharts.add(new org.moseti.kedevsapi.users.service.PdfExportService.ExportChartData(
                        "applications-over-time",
                        "Job Applications Over Time",
                        "Daily submission counts showing candidate application activity across the platform over the last 30 days.",
                        List.of("Date", "Applications Submitted"),
                        rows
                ));
            } else if ("job-types".equalsIgnoreCase(chartId)) {
                AnalyticsSummaryResponse summary = getAnalyticsSummary();
                List<List<String>> rows = summary.jobTypeBreakdown().entrySet().stream()
                        .map(e -> List.of(e.getKey(), String.valueOf(e.getValue())))
                        .collect(Collectors.toList());
                exportCharts.add(new org.moseti.kedevsapi.users.service.PdfExportService.ExportChartData(
                        "job-types",
                        "Job Types & Work Arrangements",
                        "Platform distribution of roles based on work environment and employment types.",
                        List.of("Classification", "Total Postings"),
                        rows
                ));
            } else if ("availability-status".equalsIgnoreCase(chartId)) {
                AnalyticsSummaryResponse summary = getAnalyticsSummary();
                List<List<String>> rows = List.of(
                        List.of("Open to Offers", String.valueOf(summary.availabilityBreakdown().openToOffers())),
                        List.of("Not Available", String.valueOf(summary.availabilityBreakdown().notAvailable()))
                );
                exportCharts.add(new org.moseti.kedevsapi.users.service.PdfExportService.ExportChartData(
                        "availability-status",
                        "Developer Availability Breakdown",
                        "Split showing active talent pool availability across different status flags.",
                        List.of("Status", "Developer Count"),
                        rows
                ));
            } else if ("top-skills".equalsIgnoreCase(chartId)) {
                List<SkillCountResponse> data = getTopSkills();
                List<List<String>> rows = data.stream()
                        .map(item -> List.of(item.skill(), String.valueOf(item.count())))
                        .collect(Collectors.toList());
                exportCharts.add(new org.moseti.kedevsapi.users.service.PdfExportService.ExportChartData(
                        "top-skills",
                        "Top Developer Skills in Demand",
                        "Most popular technical and domain skills listed by developers on the platform.",
                        List.of("Skill / Tech", "Total Developers"),
                        rows
                ));
            } else if ("revenue-by-type".equalsIgnoreCase(chartId)) {
                List<RevenueByTypeResponse> data = getRevenueByType();
                List<List<String>> rows = new java.util.ArrayList<>();
                for (RevenueByTypeResponse item : data) {
                    for (Map.Entry<String, BigDecimal> entry : item.byType().entrySet()) {
                        rows.add(List.of(item.month(), entry.getKey(), "$" + entry.getValue().toPlainString()));
                    }
                }
                exportCharts.add(new org.moseti.kedevsapi.users.service.PdfExportService.ExportChartData(
                        "revenue-by-type",
                        "Revenue Breakdown by Payment Type",
                        "Monthly total financial streams showing allocations for highlights, pins, and verification badges.",
                        List.of("Month", "Payment Type", "Revenue"),
                        rows
                ));
            } else if ("verification-outcomes".equalsIgnoreCase(chartId)) {
                AnalyticsSummaryResponse summary = getAnalyticsSummary();
                List<List<String>> rows = summary.verificationStats().stream()
                        .map(item -> List.of(
                                item.month(),
                                String.valueOf(item.pending()),
                                String.valueOf(item.approved()),
                                String.valueOf(item.rejected())
                        ))
                        .collect(Collectors.toList());
                exportCharts.add(new org.moseti.kedevsapi.users.service.PdfExportService.ExportChartData(
                        "verification-outcomes",
                        "Verification Request Outcomes",
                        "Monthly historical breakdown showing administrative processing rates and outcomes.",
                        List.of("Month", "Pending Requests", "Approved Requests", "Rejected Requests"),
                        rows
                ));
            } else if ("geographic-distribution".equalsIgnoreCase(chartId)) {
                List<LocationCountResponse> data = getDeveloperLocations();
                List<List<String>> rows = data.stream()
                        .map(item -> List.of(item.city(), String.valueOf(item.count())))
                        .collect(Collectors.toList());
                exportCharts.add(new org.moseti.kedevsapi.users.service.PdfExportService.ExportChartData(
                        "geographic-distribution",
                        "Geographic Talent Distribution",
                        "Top municipal hubs showing developer density counts across cities.",
                        List.of("City / Location", "Total Developers"),
                        rows
                ));
            }
        }
        
        return pdfExportService.generateAnalyticsPdf(exportCharts, request.dateRange(), request.generatedBy());
    }

    public byte[] generateFlagsExport(String format, String category, Boolean history) {
        List<org.moseti.kedevsapi.admin.dto.AdminDtos.FlagExportResponse> exportList = new java.util.ArrayList<>();
        java.time.format.DateTimeFormatter dtf = java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

        // 1. Fetch and map Job Flags
        if (category == null || category.isBlank() || "JOB".equalsIgnoreCase(category)) {
            List<org.moseti.kedevsapi.jobs.entity.JobFlag> jobFlags = jobFlagRepository.findAll();
            for (org.moseti.kedevsapi.jobs.entity.JobFlag f : jobFlags) {
                if (history != null) {
                    boolean isPending = f.getStatus() == FlagStatus.PENDING;
                    if (history && isPending) continue;
                    if (!history && !isPending) continue;
                }
                org.moseti.kedevsapi.jobs.entity.JobPost job = jobPostRepository.findById(f.getJobId()).orElse(null);
                String jobTitle = job != null ? job.getTitle() : "Unknown Job Post";
                org.moseti.kedevsapi.users.entity.User flagger = userRepository.findById(f.getFlaggedById()).orElse(null);
                String flaggerName = flagger != null ? flagger.getFullName() : "System Bot";
                
                exportList.add(new org.moseti.kedevsapi.admin.dto.AdminDtos.FlagExportResponse(
                        f.getCreatedAt() != null ? dtf.format(f.getCreatedAt()) : "—",
                        "JOB",
                        jobTitle,
                        f.getReason() != null ? f.getReason() : "Review Needed",
                        flaggerName,
                        f.getStatus() != null ? f.getStatus().name() : "PENDING"
                ));
            }
        }

        // 2. Fetch and map User Flags
        if (category == null || category.isBlank() || "USER".equalsIgnoreCase(category)) {
            List<org.moseti.kedevsapi.payments.entity.UserFlag> userFlags = userFlagRepository.findAll();
            for (org.moseti.kedevsapi.payments.entity.UserFlag f : userFlags) {
                if (history != null) {
                    boolean isPending = f.getStatus() == UserFlagStatus.PENDING;
                    if (history && isPending) continue;
                    if (!history && !isPending) continue;
                }
                org.moseti.kedevsapi.users.entity.User flaggedUser = userRepository.findById(f.getFlaggedUserId()).orElse(null);
                String userEmail = flaggedUser != null ? flaggedUser.getEmail() : "Unknown User";
                org.moseti.kedevsapi.users.entity.User flagger = userRepository.findById(f.getFlaggedById()).orElse(null);
                String flaggerName = flagger != null ? flagger.getFullName() : "System Bot";

                exportList.add(new org.moseti.kedevsapi.admin.dto.AdminDtos.FlagExportResponse(
                        f.getCreatedAt() != null ? dtf.format(f.getCreatedAt()) : "—",
                        "USER",
                        userEmail,
                        f.getReason() != null ? f.getReason() : "Review Needed",
                        flaggerName,
                        f.getStatus() != null ? f.getStatus().name() : "PENDING"
                ));
            }
        }

        // 3. Fetch and map Comment Flags
        if (category == null || category.isBlank() || "COMMENT".equalsIgnoreCase(category)) {
            List<org.moseti.kedevsapi.forum.entity.CommentFlag> commentFlags = commentFlagRepository.findAll();
            for (org.moseti.kedevsapi.forum.entity.CommentFlag f : commentFlags) {
                if (history != null) {
                    boolean isPending = f.getStatus() == CommentFlagStatus.PENDING;
                    if (history && isPending) continue;
                    if (!history && !isPending) continue;
                }
                org.moseti.kedevsapi.forum.entity.ForumComment comment = f.getComment();
                String commentContent = comment != null ? comment.getContent() : "Unknown Comment";
                if (commentContent.length() > 50) {
                    commentContent = commentContent.substring(0, 47) + "...";
                }
                org.moseti.kedevsapi.users.entity.User flagger = userRepository.findById(f.getFlaggedById()).orElse(null);
                String flaggerName = flagger != null ? flagger.getFullName() : "System Bot";

                exportList.add(new org.moseti.kedevsapi.admin.dto.AdminDtos.FlagExportResponse(
                        f.getCreatedAt() != null ? dtf.format(f.getCreatedAt()) : "—",
                        "COMMENT",
                        commentContent,
                        f.getReason() != null ? f.getReason() : "Review Needed",
                        flaggerName,
                        f.getStatus() != null ? f.getStatus().name() : "PENDING"
                ));
            }
        }

        // Sort by date descending
        exportList.sort((a, b) -> b.date().compareTo(a.date()));

        StringBuilder sb = new StringBuilder();
        if (category != null && !category.isBlank()) {
            sb.append("Category: ").append(category.toUpperCase()).append("; ");
        } else {
            sb.append("Category: All; ");
        }
        if (history != null) {
            sb.append("Scope: ").append(history ? "Reviewed History" : "Active Pending").append("; ");
        } else {
            sb.append("Scope: All (Pending & Historical); ");
        }
        String filterSummary = sb.toString();

        if ("csv".equalsIgnoreCase(format)) {
            return csvExportService.generateFlagsCsv(exportList);
        } else {
            return pdfExportService.generateFlagsPdf(exportList, filterSummary);
        }
    }
}
