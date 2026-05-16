package org.moseti.kedevsapi.admin.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.moseti.kedevsapi.admin.dto.AdminDtos.*;
import org.moseti.kedevsapi.admin.entity.AdminAction;
import org.moseti.kedevsapi.admin.exception.CannotActionAdminException;
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
import org.moseti.kedevsapi.payments.repository.PaymentRepository;
import org.moseti.kedevsapi.payments.repository.PlatformSettingRepository;
import org.moseti.kedevsapi.payments.repository.UserFlagRepository;
import org.moseti.kedevsapi.shared.enums.*;
import org.moseti.kedevsapi.shared.exception.ResourceNotFoundException;
import org.moseti.kedevsapi.users.entity.DeveloperProfile;
import org.moseti.kedevsapi.users.entity.EmployerProfile;
import org.moseti.kedevsapi.users.entity.User;
import org.moseti.kedevsapi.users.repository.DeveloperProfileRepository;
import org.moseti.kedevsapi.users.repository.EmployerProfileRepository;
import org.moseti.kedevsapi.users.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock private AdminActionRepository adminActionRepository;
    @Mock private UserRepository userRepository;
    @Mock private DeveloperProfileRepository developerProfileRepository;
    @Mock private EmployerProfileRepository employerProfileRepository;
    @Mock private JobPostRepository jobPostRepository;
    @Mock private JobFlagRepository jobFlagRepository;
    @Mock private JobApplicationRepository jobApplicationRepository;
    @Mock private ForumCommentRepository forumCommentRepository;
    @Mock private CommentFlagRepository commentFlagRepository;
    @Mock private PaymentRepository paymentRepository;
    @Mock private PlatformSettingRepository platformSettingRepository;
    @Mock private UserFlagRepository userFlagRepository;
    @Mock private NotificationService notificationService;

    @InjectMocks
    private AdminService adminService;

    private UUID adminId;
    private UUID userId;
    private User user;

    @BeforeEach
    void setUp() {
        adminId = UUID.randomUUID();
        userId = UUID.randomUUID();
        user = new User();
        user.setId(userId);
        user.setEmail("user@test.com");
        user.setRole(Role.DEVELOPER);
        user.setAccountStatus(AccountStatus.PENDING_APPROVAL);
    }

    // --- User Management ---

    @Test
    void approveEmployer_success_setsApprovedAndActive() {
        UUID profileId = UUID.randomUUID();
        EmployerProfile profile = new EmployerProfile();
        profile.setId(profileId);
        profile.setUserId(userId);
        profile.setApproved(false);

        when(employerProfileRepository.findById(profileId)).thenReturn(Optional.of(profile));
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        adminService.approveEmployer(adminId, profileId, new ApproveEmployerRequest(true, "Looks good"));

        assertTrue(profile.isApproved());
        assertEquals(AccountStatus.ACTIVE, user.getAccountStatus());
        verify(adminActionRepository).save(any(AdminAction.class));
        verify(notificationService).notify(eq(userId), any(), any(), any(), any());
    }

    @Test
    void approveEmployer_reject_setsBanned() {
        UUID profileId = UUID.randomUUID();
        EmployerProfile profile = new EmployerProfile();
        profile.setId(profileId);
        profile.setUserId(userId);

        when(employerProfileRepository.findById(profileId)).thenReturn(Optional.of(profile));
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        adminService.approveEmployer(adminId, profileId, new ApproveEmployerRequest(false, "Incomplete info"));

        assertEquals(AccountStatus.BANNED, user.getAccountStatus());
        verify(notificationService).notify(eq(userId), any(), any(), any(), any());
    }

    @Test
    void performUserAction_suspend_setsStatus() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        adminService.performUserAction(adminId, userId, new UserActionRequest("SUSPEND", "Spamming"));

        assertEquals(AccountStatus.SUSPENDED, user.getAccountStatus());
        verify(adminActionRepository).save(any(AdminAction.class));
    }

    @Test
    void performUserAction_targetIsAdmin_throws() {
        user.setRole(Role.ADMIN);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        assertThrows(CannotActionAdminException.class, () -> 
            adminService.performUserAction(adminId, userId, new UserActionRequest("BAN", "Bad admin")));
    }

    // --- Flagged Content ---

    @Test
    void reviewJobFlag_remove_setsJobStatusRemoved() {
        UUID flagId = UUID.randomUUID();
        UUID jobId = UUID.randomUUID();
        JobFlag flag = new JobFlag();
        flag.setId(flagId);
        flag.setJobId(jobId);
        
        JobPost job = new JobPost();
        job.setId(jobId);
        job.setTitle("Scam Job");
        job.setPostedById(UUID.randomUUID());

        when(jobFlagRepository.findById(flagId)).thenReturn(Optional.of(flag));
        when(jobPostRepository.findById(jobId)).thenReturn(Optional.of(job));

        adminService.reviewJobFlag(adminId, flagId, new ReviewJobFlagRequest("REMOVE", "Confirmed scam"));

        assertEquals(JobStatus.REMOVED, job.getStatus());
        assertEquals(FlagStatus.REVIEWED_REMOVED, flag.getStatus());
        verify(notificationService).notify(eq(job.getPostedById()), eq(NotificationCategory.FLAG), any(), any(), any());
    }

    @Test
    void reviewCommentFlag_removed_hidesComment() {
        UUID flagId = UUID.randomUUID();
        UUID commentId = UUID.randomUUID();
        ForumComment comment = new ForumComment();
        comment.setId(commentId);
        comment.setContent("Toxic");

        CommentFlag flag = new CommentFlag();
        flag.setId(flagId);
        flag.setComment(comment);

        when(commentFlagRepository.findById(flagId)).thenReturn(Optional.of(flag));

        adminService.reviewCommentFlag(adminId, flagId, new ReviewCommentFlagRequest("REMOVED", "Toxic content"));

        assertTrue(comment.isHidden());
        assertEquals(CommentFlagStatus.REVIEWED_REMOVED, flag.getStatus());
    }

    // --- Badge Management ---

    @Test
    void performBadgeAction_grant_setsVerifiedTrue() {
        DeveloperProfile profile = new DeveloperProfile();
        profile.setUserId(userId);
        profile.setVerified(false);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(developerProfileRepository.findByUserId(userId)).thenReturn(Optional.of(profile));

        adminService.performBadgeAction(adminId, userId, new BadgeActionRequest("GRANT", "Top contributor"));

        assertTrue(profile.isVerified());
        verify(notificationService).notify(eq(userId), any(), any(), any(), any());
    }

    // --- Platform Settings ---

    @Test
    void updatePlatformSetting_success_updatesValue() {
        String key = "SPOTLIGHT_PRICE_DAY";
        PlatformSetting setting = new PlatformSetting();
        setting.setSettingKey(key);
        setting.setSettingValue("500");

        when(platformSettingRepository.findBySettingKey(key)).thenReturn(Optional.of(setting));

        PlatformSettingResponse res = adminService.updatePlatformSetting(adminId, key, new UpdateSettingRequest("600"));

        assertEquals("600", res.settingValue());
        assertEquals("600", setting.getSettingValue());
        verify(adminActionRepository).save(any(AdminAction.class));
    }

    // --- Analytics ---

    @Test
    void getRevenueBreakdown_returnsCorrectTotals() {
        when(paymentRepository.getTotalRevenue()).thenReturn(new BigDecimal("10000"));
        when(paymentRepository.getRevenueAfter(any())).thenReturn(new BigDecimal("1000"));
        when(paymentRepository.getRevenueByType()).thenReturn(Collections.emptyList());
        when(paymentRepository.count()).thenReturn(50L);
        when(paymentRepository.countByStatus(PaymentStatus.COMPLETED)).thenReturn(45L);
        when(paymentRepository.countByStatus(PaymentStatus.FAILED)).thenReturn(5L);

        RevenueBreakdownResponse res = adminService.getRevenueBreakdown();

        assertEquals(new BigDecimal("10000"), res.totalRevenue());
        assertEquals(45, res.completedPayments());
    }

    @Test
    void getAnalyticsSummary_assemblesAllData() {
        // Mock all sub-calls or handle them via mocks they call
        when(userRepository.count()).thenReturn(100L);
        when(userRepository.countByRole(any())).thenReturn(40L);
        when(userRepository.countByCreatedAtAfter(any())).thenReturn(5L);
        when(employerProfileRepository.countByIsApprovedFalse()).thenReturn(2L);
        
        // Mock revenue
        when(paymentRepository.getTotalRevenue()).thenReturn(new BigDecimal("5000"));
        when(paymentRepository.getRevenueAfter(any())).thenReturn(new BigDecimal("500"));
        when(paymentRepository.getRevenueByType()).thenReturn(Collections.emptyList());
        
        
        // Mock forum
        when(forumCommentRepository.count()).thenReturn(200L);
        when(forumCommentRepository.findMostActiveJob(any())).thenReturn(Collections.emptyList());
        
        // Mock flags
        when(jobFlagRepository.countByStatus(any())).thenReturn(1L);
        when(userFlagRepository.countByStatus(any())).thenReturn(1L);
        when(commentFlagRepository.countByStatus(any())).thenReturn(1L);

        // Mock top jobs
        when(jobPostRepository.findByStatusNotOrderByUpvoteCountDesc(any(), any())).thenReturn(Page.empty());
        
        // Mock recent actions
        when(adminActionRepository.findAll(any(Pageable.class))).thenReturn(Page.empty());

        AnalyticsSummaryResponse res = adminService.getAnalyticsSummary();

        assertEquals(100, res.totalUsers());
        assertEquals(2, res.pendingEmployerApprovals());
        assertNotNull(res.revenue());
    }
}
