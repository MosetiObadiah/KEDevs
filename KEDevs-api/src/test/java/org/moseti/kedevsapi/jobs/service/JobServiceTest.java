package org.moseti.kedevsapi.jobs.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.moseti.kedevsapi.jobs.dto.JobDtos.*;
import org.moseti.kedevsapi.jobs.entity.*;
import org.moseti.kedevsapi.jobs.exception.*;
import org.moseti.kedevsapi.jobs.repository.*;
import org.moseti.kedevsapi.shared.enums.*;
import org.moseti.kedevsapi.shared.exception.BadRequestException;
import org.moseti.kedevsapi.shared.exception.ForbiddenException;
import org.moseti.kedevsapi.users.dto.UserDtos;
import org.moseti.kedevsapi.users.entity.User;
import org.moseti.kedevsapi.users.entity.DeveloperProfile;
import org.moseti.kedevsapi.users.repository.DeveloperProfileRepository;
import org.moseti.kedevsapi.users.repository.UserRepository;
import org.moseti.kedevsapi.users.service.EmployerProfileService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JobServiceTest {

    @Mock private JobPostRepository jobPostRepository;
    @Mock private JobTagRepository jobTagRepository;
    @Mock private JobVoteRepository jobVoteRepository;
    @Mock private JobFlagRepository jobFlagRepository;
    @Mock private JobApplicationRepository jobApplicationRepository;
    @Mock private UserRepository userRepository;
    @Mock private DeveloperProfileRepository developerProfileRepository;
    @Mock private org.moseti.kedevsapi.users.repository.EmployerProfileRepository employerProfileRepository;
    @Mock private EmployerProfileService employerProfileService;
    @Mock private org.moseti.kedevsapi.notifications.service.NotificationService notificationService;
    @Mock private org.moseti.kedevsapi.auth.service.EmailService emailService;
    @Mock private org.moseti.kedevsapi.shared.service.FileUploadService fileUploadService;
    @Mock private org.moseti.kedevsapi.users.service.PdfExportService pdfExportService;
    @Mock private org.moseti.kedevsapi.payments.repository.PlatformSettingRepository platformSettingRepository;

    @InjectMocks private JobService jobService;

    private UUID userId;
    private UUID jobId;
    private User developer;
    private User employer;
    private JobPost jobPost;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        jobId = UUID.randomUUID();

        developer = new User();
        developer.setId(userId);
        developer.setRole(Role.DEVELOPER);
        developer.setFullName("Dev Name");

        employer = new User();
        employer.setId(userId);
        employer.setRole(Role.EMPLOYER);
        employer.setFullName("Emp Name");

        jobPost = new JobPost();
        jobPost.setId(jobId);
        jobPost.setPostedById(userId);
        jobPost.setStatus(JobStatus.OPEN);
        jobPost.setVisibility(JobVisibility.PUBLIC);
        jobPost.setPeerSourced(false);

        lenient().when(jobApplicationRepository.findByJobId(any(), any())).thenReturn(Page.empty());
        lenient().when(developerProfileRepository.findByUserId(any())).thenReturn(Optional.empty());
        lenient().when(employerProfileRepository.findByUserId(any())).thenReturn(Optional.empty());
    }

    // 1. createJobPost_success_developer
    @Test
    void createJobPost_success_developer() {
        CreateJobPostRequest request = new CreateJobPostRequest("Title", "Sum", "Desc", "Comp", "City", "Country",
                JobType.FULL_TIME, WorkType.REMOTE, ExperienceLevel.MID, "BSc", 3,
                BigDecimal.valueOf(100), BigDecimal.valueOf(200), "KES", null, null, false, JobVisibility.PUBLIC, List.of("Java"));

        when(userRepository.findById(userId)).thenReturn(Optional.of(developer));
        when(jobPostRepository.save(any(JobPost.class))).thenAnswer(i -> {
            JobPost j = i.getArgument(0);
            j.setId(jobId);
            return j;
        });

        JobPostResponse response = jobService.createJobPost(userId, request);

        assertThat(response).isNotNull();
        assertThat(response.companyName()).isEqualTo("Comp");
        verify(jobTagRepository, times(1)).save(any(JobTag.class));
    }

    // 2. createJobPost_success_employer
    @Test
    void createJobPost_success_employer() {
        CreateJobPostRequest request = new CreateJobPostRequest("Title", "Sum", "Desc", "Overridden", "City", "Country",
                JobType.FULL_TIME, WorkType.REMOTE, ExperienceLevel.MID, "BSc", 3,
                BigDecimal.valueOf(100), BigDecimal.valueOf(200), "KES", null, null, false, JobVisibility.PUBLIC, null);

        when(userRepository.findById(userId)).thenReturn(Optional.of(employer));
        when(employerProfileService.getProfileByUserId(userId)).thenReturn(
                new UserDtos.EmployerProfileResponse(UUID.randomUUID(), userId, "CP", "cp@company.com", "TrueCompany", null, null, null, null, null, null, null, null, null, null, null, true, true, 0, java.time.LocalDateTime.now())
        );
        when(jobPostRepository.save(any(JobPost.class))).thenAnswer(i -> {
            JobPost j = i.getArgument(0);
            j.setId(jobId);
            return j;
        });

        JobPostResponse response = jobService.createJobPost(userId, request);

        assertThat(response.companyName()).isEqualTo("TrueCompany");
    }

    // 3. createJobPost_peerSourced_requiresSourceUrl
    @Test
    void createJobPost_peerSourced_requiresSourceUrl() {
        CreateJobPostRequest request = new CreateJobPostRequest("Title", "Sum", "Desc", "Comp", "City", "Country",
                JobType.FULL_TIME, WorkType.REMOTE, ExperienceLevel.MID, "BSc", 3,
                null, null, "KES", null, null, true, JobVisibility.PUBLIC, null);

        assertThatThrownBy(() -> jobService.createJobPost(userId, request))
                .isInstanceOf(BadRequestException.class);
    }

    // 4. getJobPost_success
    @Test
    void getJobPost_success() {
        when(jobPostRepository.findById(jobId)).thenReturn(Optional.of(jobPost));
        when(userRepository.findById(userId)).thenReturn(Optional.of(developer));

        JobPostResponse response = jobService.getJobPost(jobId, userId);

        assertThat(response.id()).isEqualTo(jobId);
        assertThat(response.hasApplied()).isFalse();
    }

    // 5. getJobPost_removed_throwsNotFound
    @Test
    void getJobPost_removed_throwsNotFound() {
        jobPost.setStatus(JobStatus.REMOVED);
        when(jobPostRepository.findById(jobId)).thenReturn(Optional.of(jobPost));

        assertThatThrownBy(() -> jobService.getJobPost(jobId, userId))
                .isInstanceOf(JobNotFoundException.class);
    }

    @Test
    void getPublicJobs_onlyReturnsPublicOpen() {
        Pageable pageable = PageRequest.of(0, 10);
        when(jobPostRepository.findByVisibilityAndStatusOrderByUpvoteCountDescCreatedAtDesc(
                JobVisibility.PUBLIC, JobStatus.OPEN, pageable))
                .thenReturn(new PageImpl<>(List.of(jobPost)));

        Page<JobSummaryResponse> response = jobService.getPublicJobs(null, pageable);
        assertThat(response.getContent()).hasSize(1);
    }

    @Test
    void getPublicJobs_withPostedById_returnsFiltered() {
        Pageable pageable = PageRequest.of(0, 10);
        UUID postedBy = UUID.randomUUID();
        when(jobPostRepository.findByVisibilityAndStatusAndPostedByIdOrderByUpvoteCountDescCreatedAtDesc(
                JobVisibility.PUBLIC, JobStatus.OPEN, postedBy, pageable))
                .thenReturn(new PageImpl<>(List.of(jobPost)));

        Page<JobSummaryResponse> response = jobService.getPublicJobs(postedBy, pageable);
        assertThat(response.getContent()).hasSize(1);
    }

    // 7. updateJobPost_success_owner
    @Test
    void updateJobPost_success_owner() {
        UpdateJobPostRequest request = new UpdateJobPostRequest("NewTitle", null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null);
        when(jobPostRepository.findById(jobId)).thenReturn(Optional.of(jobPost));
        when(userRepository.findById(userId)).thenReturn(Optional.of(employer));
        when(jobPostRepository.save(any(JobPost.class))).thenAnswer(i -> i.getArgument(0));

        JobPostResponse response = jobService.updateJobPost(userId, jobId, request);
        assertThat(response.title()).isEqualTo("NewTitle");
    }

    // 8. deleteJobPost_setsStatusRemoved
    @Test
    void deleteJobPost_setsStatusRemoved() {
        when(jobPostRepository.findById(jobId)).thenReturn(Optional.of(jobPost));

        jobService.deleteJobPost(userId, jobId);

        assertThat(jobPost.getStatus()).isEqualTo(JobStatus.REMOVED);
        verify(jobPostRepository).save(jobPost);
    }

    // 9. voteOnJob_newVote_incrementsCount
    @Test
    void voteOnJob_newVote_incrementsCount() {
        UUID otherUser = UUID.randomUUID();
        when(jobPostRepository.findById(jobId)).thenReturn(Optional.of(jobPost));
        when(jobVoteRepository.findByJobIdAndUserId(jobId, otherUser)).thenReturn(Optional.empty());
        when(jobVoteRepository.countByJobIdAndVoteType(jobId, VoteType.UPVOTE)).thenReturn(1);
        when(jobVoteRepository.countByJobIdAndVoteType(jobId, VoteType.DOWNVOTE)).thenReturn(0);

        jobService.voteOnJob(otherUser, jobId, new VoteRequest(VoteType.UPVOTE));

        assertThat(jobPost.getUpvoteCount()).isEqualTo(1);
        verify(jobVoteRepository).save(any(JobVote.class));
    }

    // 10. voteOnJob_sameVote_togglesOff
    @Test
    void voteOnJob_sameVote_togglesOff() {
        UUID otherUser = UUID.randomUUID();
        JobVote vote = new JobVote();
        vote.setVoteType(VoteType.UPVOTE);

        when(jobPostRepository.findById(jobId)).thenReturn(Optional.of(jobPost));
        when(jobVoteRepository.findByJobIdAndUserId(jobId, otherUser)).thenReturn(Optional.of(vote));

        jobService.voteOnJob(otherUser, jobId, new VoteRequest(VoteType.UPVOTE));

        verify(jobVoteRepository).delete(vote);
    }

    // 11. voteOnJob_oppositeVote_changesVote
    @Test
    void voteOnJob_oppositeVote_changesVote() {
        UUID otherUser = UUID.randomUUID();
        JobVote vote = new JobVote();
        vote.setVoteType(VoteType.DOWNVOTE);

        when(jobPostRepository.findById(jobId)).thenReturn(Optional.of(jobPost));
        when(jobVoteRepository.findByJobIdAndUserId(jobId, otherUser)).thenReturn(Optional.of(vote));

        jobService.voteOnJob(otherUser, jobId, new VoteRequest(VoteType.UPVOTE));

        assertThat(vote.getVoteType()).isEqualTo(VoteType.UPVOTE);
        verify(jobVoteRepository).save(vote);
    }

    // 12. voteOnJob_ownPost_throws
    @Test
    void voteOnJob_ownPost_throws() {
        when(jobPostRepository.findById(jobId)).thenReturn(Optional.of(jobPost));

        assertThatThrownBy(() -> jobService.voteOnJob(userId, jobId, new VoteRequest(VoteType.UPVOTE)))
                .isInstanceOf(BadRequestException.class);
    }

    // 13. flagJob_success
    @Test
    void flagJob_success() {
        UUID otherUser = UUID.randomUUID();
        when(jobPostRepository.findById(jobId)).thenReturn(Optional.of(jobPost));
        when(jobFlagRepository.existsByJobIdAndFlaggedById(jobId, otherUser)).thenReturn(false);
        when(userRepository.findById(any())).thenReturn(Optional.of(developer));
        when(userRepository.findByRole(Role.ADMIN)).thenReturn(List.of(new User()));

        jobService.flagJob(otherUser, jobId, new FlagJobRequest("Spam"));

        assertThat(jobPost.isFlagged()).isTrue();
        verify(jobFlagRepository).save(any(JobFlag.class));
        verify(notificationService).notify(any(), any(), any(), any(), any());
        verify(emailService).sendJobFlaggedEmail(any(), any(), any(), any());
    }

    // 14. flagJob_ownPost_throws
    @Test
    void flagJob_ownPost_throws() {
        when(jobPostRepository.findById(jobId)).thenReturn(Optional.of(jobPost));

        assertThatThrownBy(() -> jobService.flagJob(userId, jobId, new FlagJobRequest("Spam")))
                .isInstanceOf(CannotFlagOwnJobException.class);
    }

    // 15. flagJob_duplicate_throws
    @Test
    void flagJob_duplicate_throws() {
        UUID otherUser = UUID.randomUUID();
        when(jobPostRepository.findById(jobId)).thenReturn(Optional.of(jobPost));
        when(jobFlagRepository.existsByJobIdAndFlaggedById(jobId, otherUser)).thenReturn(true);

        assertThatThrownBy(() -> jobService.flagJob(otherUser, jobId, new FlagJobRequest("Spam")))
                .isInstanceOf(AlreadyFlaggedException.class);
    }

    // 16. applyToJob_success
    @Test
    void applyToJob_success() {
        UUID otherUser = UUID.randomUUID();
        when(jobPostRepository.findById(jobId)).thenReturn(Optional.of(jobPost));
        when(jobApplicationRepository.existsByJobIdAndApplicantId(jobId, otherUser)).thenReturn(false);
        when(jobApplicationRepository.save(any())).thenAnswer(i -> {
            JobApplication app = i.getArgument(0);
            app.setId(UUID.randomUUID());
            return app;
        });
        when(userRepository.findById(any())).thenReturn(Optional.of(developer));
        DeveloperProfile devProfile = new DeveloperProfile();
        devProfile.setAvailabilityStatus(AvailabilityStatus.OPEN_TO_OFFERS);
        when(developerProfileRepository.findByUserId(otherUser)).thenReturn(Optional.of(devProfile));

        JobApplicationResponse response = jobService.applyToJob(otherUser, jobId, null, null, "Cover letter");

        assertThat(response.coverLetter()).isEqualTo("Cover letter");
        verify(notificationService).notify(any(), any(), any(), any(), any());
        verify(emailService).sendJobApplicationEmail(any(), any(), any(), any());
    }

    // 17. applyToJob_peerSourced_throws
    @Test
    void applyToJob_peerSourced_throws() {
        UUID otherUser = UUID.randomUUID();
        jobPost.setPeerSourced(true);
        when(jobPostRepository.findById(jobId)).thenReturn(Optional.of(jobPost));

        assertThatThrownBy(() -> jobService.applyToJob(otherUser, jobId, null, null, null))
                .isInstanceOf(BadRequestException.class);
    }

    // 18. applyToJob_ownPost_throws
    @Test
    void applyToJob_ownPost_throws() {
        when(jobPostRepository.findById(jobId)).thenReturn(Optional.of(jobPost));

        assertThatThrownBy(() -> jobService.applyToJob(userId, jobId, null, null, null))
                .isInstanceOf(CannotApplyToOwnJobException.class);
    }

    // 19. applyToJob_duplicate_throws
    @Test
    void applyToJob_duplicate_throws() {
        UUID otherUser = UUID.randomUUID();
        when(jobPostRepository.findById(jobId)).thenReturn(Optional.of(jobPost));
        when(jobApplicationRepository.existsByJobIdAndApplicantId(jobId, otherUser)).thenReturn(true);

        assertThatThrownBy(() -> jobService.applyToJob(otherUser, jobId, null, null, null))
                .isInstanceOf(AlreadyAppliedException.class);
    }

    // 20. applyToJob_closedJob_throws
    @Test
    void applyToJob_closedJob_throws() {
        UUID otherUser = UUID.randomUUID();
        jobPost.setStatus(JobStatus.CLOSED);
        when(jobPostRepository.findById(jobId)).thenReturn(Optional.of(jobPost));

        assertThatThrownBy(() -> jobService.applyToJob(otherUser, jobId, null, null, null))
                .isInstanceOf(JobNotOpenException.class);
    }

    // 21. updateApplicationStatus_success_owner
    @Test
    void updateApplicationStatus_success_owner() {
        UUID appId = UUID.randomUUID();
        JobApplication application = new JobApplication();
        application.setId(appId);
        application.setJobPost(jobPost);

        when(jobPostRepository.findById(jobId)).thenReturn(Optional.of(jobPost));
        when(jobApplicationRepository.findByJobIdAndId(jobId, appId)).thenReturn(Optional.of(application));
        when(jobApplicationRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        JobApplicationResponse response = jobService.updateApplicationStatus(userId, jobId, appId, new UpdateApplicationStatusRequest(ApplicationStatus.SHORTLISTED, null));

        assertThat(response.status()).isEqualTo(ApplicationStatus.SHORTLISTED);
    }

    // 22. getJobApplications_notOwner_throwsForbidden
    @Test
    void getJobApplications_notOwner_throwsForbidden() {
        UUID otherUser = UUID.randomUUID();
        when(jobPostRepository.findById(jobId)).thenReturn(Optional.of(jobPost));

        assertThatThrownBy(() -> jobService.getJobApplications(otherUser, jobId, PageRequest.of(0, 10)))
                .isInstanceOf(ForbiddenException.class);
    }
}
