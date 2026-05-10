package org.moseti.kedevsapi.jobs.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.moseti.kedevsapi.jobs.dto.JobDtos.*;
import org.moseti.kedevsapi.jobs.entity.*;
import org.moseti.kedevsapi.jobs.exception.*;
import org.moseti.kedevsapi.jobs.repository.*;
import org.moseti.kedevsapi.shared.enums.*;
import org.moseti.kedevsapi.shared.exception.BadRequestException;
import org.moseti.kedevsapi.shared.exception.ForbiddenException;
import org.moseti.kedevsapi.shared.exception.ResourceNotFoundException;
import org.moseti.kedevsapi.users.entity.User;
import org.moseti.kedevsapi.users.repository.DeveloperProfileRepository;
import org.moseti.kedevsapi.users.repository.UserRepository;
import org.moseti.kedevsapi.users.service.EmployerProfileService;
import org.moseti.kedevsapi.shared.service.FileUploadService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class JobService {

    private final JobPostRepository jobPostRepository;
    private final JobTagRepository jobTagRepository;
    private final JobVoteRepository jobVoteRepository;
    private final JobFlagRepository jobFlagRepository;
    private final JobApplicationRepository jobApplicationRepository;

    private final UserRepository userRepository;
    private final DeveloperProfileRepository developerProfileRepository;
    private final EmployerProfileService employerProfileService;
    private final FileUploadService fileUploadService;
    private final org.moseti.kedevsapi.notifications.service.NotificationService notificationService;
    private final org.moseti.kedevsapi.auth.service.EmailService emailService;
    private final WebClient.Builder webClientBuilder;

    @Value("${app.api-base-url:http://localhost:8080}")
    private String apiBaseUrl;

    @Transactional
    public JobPostResponse createJobPost(UUID userId, CreateJobPostRequest request) {
        if (request.isPeerSourced() && (request.sourceUrl() == null || request.sourceUrl().isBlank())) {
            throw new BadRequestException("sourceUrl is required for peer-sourced jobs");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        JobPost job = new JobPost();
        job.setPostedById(userId);
        job.setTitle(request.title());
        job.setSummary(request.summary());
        job.setDescription(request.description());

        if (user.getRole() == Role.EMPLOYER) {
            try {
                var profile = employerProfileService.getProfileByUserId(userId);
                job.setCompanyName(profile.companyName());
            } catch (ResourceNotFoundException | org.moseti.kedevsapi.users.exception.ProfileNotFoundException e) {
                job.setCompanyName(request.companyName());
            }
            job.setPeerSourced(false);
            job.setSourceUrl(null);
        } else {
            job.setCompanyName(request.companyName());
            job.setPeerSourced(request.isPeerSourced());
            job.setSourceUrl(request.sourceUrl());
        }

        job.setLocationCity(request.locationCity());
        job.setLocationCountry(request.locationCountry());
        job.setJobType(request.jobType());
        job.setWorkType(request.workType());
        job.setExperienceLevel(request.experienceLevel());
        job.setMinQualification(request.minQualification());
        job.setMinExperienceYears(request.minExperienceYears());
        job.setSalaryRangeMin(request.salaryRangeMin());
        job.setSalaryRangeMax(request.salaryRangeMax());
        job.setSalaryCurrency(request.salaryCurrency() != null ? request.salaryCurrency() : "KES");
        job.setApplicationDeadline(request.applicationDeadline());
        job.setVisibility(request.visibility());
        job.setStatus(JobStatus.OPEN);

        job = jobPostRepository.save(job);

        if (request.tags() != null && !request.tags().isEmpty()) {
            for (String tag : request.tags()) {
                JobTag jobTag = new JobTag();
                jobTag.setJobPost(job);
                jobTag.setTag(tag);
                jobTagRepository.save(jobTag);
            }
        }

        return toJobPostResponse(job, userId);
    }

    public JobPostResponse getJobPost(UUID jobId, UUID currentUserId) {
        JobPost job = jobPostRepository.findById(jobId)
                .orElseThrow(() -> new JobNotFoundException("Job not found"));

        if (job.getStatus() == JobStatus.REMOVED) {
            throw new JobNotFoundException("Job not found");
        }

        return toJobPostResponse(job, currentUserId);
    }

    public Page<JobSummaryResponse> getPublicJobs(Pageable pageable) {
        return jobPostRepository.findByVisibilityAndStatusOrderByUpvoteCountDescCreatedAtDesc(
                JobVisibility.PUBLIC, JobStatus.OPEN, pageable)
                .map(this::toJobSummaryResponse);
    }

    public Page<JobSummaryResponse> getJobFeed(JobSearchRequest request, Pageable pageable, UUID currentUserId) {
        return jobPostRepository.searchJobs(
                request.keyword(), request.locationCity(), request.locationCountry(),
                request.jobType(), request.workType(), request.experienceLevel(),
                request.status(), request.visibility(), pageable)
                .map(this::toJobSummaryResponse);
    }

    public Page<JobSummaryResponse> getMyJobPosts(UUID userId, Pageable pageable) {
        return jobPostRepository.findByPostedById(userId, pageable)
                .map(this::toJobSummaryResponse);
    }

    @Transactional
    public JobPostResponse updateJobPost(UUID userId, UUID jobId, UpdateJobPostRequest request) {
        JobPost job = jobPostRepository.findById(jobId)
                .orElseThrow(() -> new JobNotFoundException("Job not found"));

        if (!job.getPostedById().equals(userId)) {
            throw new ForbiddenException("Not authorized to update this job");
        }

        if (request.title() != null) job.setTitle(request.title());
        if (request.summary() != null) job.setSummary(request.summary());
        if (request.description() != null) job.setDescription(request.description());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getRole() == Role.EMPLOYER) {
            // Employers cannot make jobs peer sourced
            job.setPeerSourced(false);
            job.setSourceUrl(null);
            
            // If they provided a company name, ignore it and keep the one set on creation or profile
            if (request.companyName() != null) {
                try {
                    var profile = employerProfileService.getProfileByUserId(userId);
                    job.setCompanyName(profile.companyName());
                } catch (Exception e) {
                    // Fallback to existing
                }
            }
        } else {
            if (request.companyName() != null) job.setCompanyName(request.companyName());
            if (request.sourceUrl() != null) job.setSourceUrl(request.sourceUrl());
            if (request.isPeerSourced() != null) job.setPeerSourced(request.isPeerSourced());
        }

        if (request.locationCity() != null) job.setLocationCity(request.locationCity());
        if (request.locationCountry() != null) job.setLocationCountry(request.locationCountry());
        if (request.jobType() != null) job.setJobType(request.jobType());
        if (request.workType() != null) job.setWorkType(request.workType());
        if (request.experienceLevel() != null) job.setExperienceLevel(request.experienceLevel());
        if (request.minQualification() != null) job.setMinQualification(request.minQualification());
        if (request.minExperienceYears() != null) job.setMinExperienceYears(request.minExperienceYears());
        if (request.salaryRangeMin() != null) job.setSalaryRangeMin(request.salaryRangeMin());
        if (request.salaryRangeMax() != null) job.setSalaryRangeMax(request.salaryRangeMax());
        if (request.salaryCurrency() != null) job.setSalaryCurrency(request.salaryCurrency());
        if (request.applicationDeadline() != null) job.setApplicationDeadline(request.applicationDeadline());
        
        if (request.visibility() != null) job.setVisibility(request.visibility());

        job = jobPostRepository.save(job);

        // Replace tags
        if (request.tags() != null) {
            List<JobTag> existingTags = jobTagRepository.findByJobId(jobId);
            jobTagRepository.deleteAll(existingTags);
            
            for (String tag : request.tags()) {
                JobTag jobTag = new JobTag();
                jobTag.setJobPost(job);
                jobTag.setTag(tag);
                jobTagRepository.save(jobTag);
            }
        }

        return toJobPostResponse(job, userId);
    }

    @Transactional
    public void deleteJobPost(UUID userId, UUID jobId) {
        JobPost job = jobPostRepository.findById(jobId)
                .orElseThrow(() -> new JobNotFoundException("Job not found"));

        if (!job.getPostedById().equals(userId)) {
            throw new ForbiddenException("Not authorized to delete this job");
        }

        job.setStatus(JobStatus.REMOVED);
        jobPostRepository.save(job);
    }

    @Transactional
    public JobPostResponse updateJobStatus(UUID userId, UUID jobId, JobStatus status) {
        JobPost job = jobPostRepository.findById(jobId)
                .orElseThrow(() -> new JobNotFoundException("Job not found"));

        if (!job.getPostedById().equals(userId)) {
            throw new ForbiddenException("Not authorized to update status");
        }

        if (status == JobStatus.UNDER_REVIEW || status == JobStatus.REMOVED) {
            throw new BadRequestException("Cannot set status to UNDER_REVIEW or REMOVED");
        }

        job.setStatus(status);
        job = jobPostRepository.save(job);
        return toJobPostResponse(job, userId);
    }

    @Transactional
    public void voteOnJob(UUID userId, UUID jobId, VoteRequest request) {
        JobPost job = jobPostRepository.findById(jobId)
                .orElseThrow(() -> new JobNotFoundException("Job not found"));

        if (job.getPostedById().equals(userId)) {
            throw new BadRequestException("Cannot vote on your own job");
        }

        Optional<JobVote> existingVoteOpt = jobVoteRepository.findByJobIdAndUserId(jobId, userId);

        if (existingVoteOpt.isPresent()) {
            JobVote existingVote = existingVoteOpt.get();
            if (existingVote.getVoteType() == request.voteType()) {
                jobVoteRepository.delete(existingVote);
            } else {
                existingVote.setVoteType(request.voteType());
                jobVoteRepository.save(existingVote);
            }
        } else {
            JobVote newVote = new JobVote();
            newVote.setJobPost(job);
            newVote.setUserId(userId);
            newVote.setVoteType(request.voteType());
            jobVoteRepository.save(newVote);
        }

        int upvotes = jobVoteRepository.countByJobIdAndVoteType(jobId, VoteType.UPVOTE);
        int downvotes = jobVoteRepository.countByJobIdAndVoteType(jobId, VoteType.DOWNVOTE);
        job.setUpvoteCount(upvotes - downvotes);
        jobPostRepository.save(job);
    }

    @Transactional
    public void flagJob(UUID userId, UUID jobId, FlagJobRequest request) {
        JobPost job = jobPostRepository.findById(jobId)
                .orElseThrow(() -> new JobNotFoundException("Job not found"));

        if (job.getPostedById().equals(userId)) {
            throw new CannotFlagOwnJobException("Cannot flag your own job");
        }

        if (jobFlagRepository.existsByJobIdAndFlaggedById(jobId, userId)) {
            throw new AlreadyFlaggedException("You have already flagged this job");
        }

        JobFlag flag = new JobFlag();
        flag.setJobPost(job);
        flag.setFlaggedById(userId);
        flag.setReason(request.reason());
        flag.setStatus(FlagStatus.PENDING);
        jobFlagRepository.save(flag);

        job.setFlagged(true);
        jobPostRepository.save(job);

        String reporterName = userRepository.findById(userId).map(User::getFullName).orElse("Unknown");
        List<User> admins = userRepository.findByRole(Role.ADMIN);
        for (User admin : admins) {
            notificationService.notify(
                    admin.getId(),
                    org.moseti.kedevsapi.shared.enums.NotificationCategory.FLAG,
                    "Job Flagged",
                    "Job '" + job.getTitle() + "' has been flagged.",
                    "{\"jobId\":\"" + jobId + "\"}"
            );
            emailService.sendJobFlaggedEmail(admin.getEmail(), job.getTitle(), reporterName, request.reason());
        }
    }

    @Transactional
    public JobApplicationResponse applyToJob(UUID userId, UUID jobId, MultipartFile resume, MultipartFile coverLetterFile, String coverLetterText) {
        JobPost job = jobPostRepository.findById(jobId)
                .orElseThrow(() -> new JobNotFoundException("Job not found"));

        if (job.isPeerSourced()) {
            throw new BadRequestException("Peer-sourced jobs must be applied externally");
        }

        if (job.getStatus() != JobStatus.OPEN) {
            throw new JobNotOpenException("Job is not open for applications");
        }

        if (job.getPostedById().equals(userId)) {
            throw new CannotApplyToOwnJobException("Cannot apply to your own job");
        }

        if (jobApplicationRepository.existsByJobIdAndApplicantId(jobId, userId)) {
            throw new AlreadyAppliedException("Already applied to this job");
        }

        // Upload resume to Cloudinary (required)
        String resumeUrl = fileUploadService.uploadFile(resume, "kedevs/resumes");

        // Upload cover letter file if provided
        String coverLetterUrl = null;
        if (coverLetterFile != null && !coverLetterFile.isEmpty()) {
            coverLetterUrl = fileUploadService.uploadFile(coverLetterFile, "kedevs/cover-letters");
        }

        JobApplication application = new JobApplication();
        application.setJobPost(job);
        application.setApplicantId(userId);
        application.setCoverLetter(coverLetterText);
        application.setResumeUrl(resumeUrl);
        application.setCoverLetterUrl(coverLetterUrl);
        application.setStatus(ApplicationStatus.PENDING);
        application = jobApplicationRepository.save(application);

        User applicant = userRepository.findById(userId).orElse(null);
        User poster = userRepository.findById(job.getPostedById()).orElse(null);
        
        if (applicant != null && poster != null) {
            notificationService.notify(
                    job.getPostedById(),
                    org.moseti.kedevsapi.shared.enums.NotificationCategory.JOB,
                    "New Application",
                    applicant.getFullName() + " applied to your job: " + job.getTitle(),
                    "{\"jobId\":\"" + jobId + "\",\"applicationId\":\"" + application.getId() + "\"}"
            );
            emailService.sendJobApplicationEmail(poster.getEmail(), poster.getFullName(), job.getTitle(), applicant.getFullName());
        }

        return toJobApplicationResponse(application);
    }

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public Page<JobApplicationResponse> getJobApplications(UUID userId, UUID jobId, Pageable pageable) {
        JobPost job = jobPostRepository.findById(jobId)
                .orElseThrow(() -> new JobNotFoundException("Job not found"));

        if (!job.getPostedById().equals(userId)) {
            throw new ForbiddenException("Not authorized to view these applications");
        }

        return jobApplicationRepository.findByJobId(jobId, pageable)
                .map(this::toJobApplicationResponse);
    }

    @Transactional
    public JobApplicationResponse updateApplicationStatus(UUID userId, UUID jobId, UUID applicationId, UpdateApplicationStatusRequest request) {
        JobPost job = jobPostRepository.findById(jobId)
                .orElseThrow(() -> new JobNotFoundException("Job not found"));

        if (!job.getPostedById().equals(userId)) {
            throw new ForbiddenException("Not authorized to update this application");
        }

        JobApplication application = jobApplicationRepository.findByJobIdAndId(jobId, applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        application.setStatus(request.status());
        application = jobApplicationRepository.save(application);

        String statusLabel = switch (request.status()) {
            case SHORTLISTED -> "accepted ✅";
            case REJECTED -> "not moved forward with at this time";
            case VIEWED -> "reviewed";
            default -> request.status().name().toLowerCase();
        };

        String notifTitle = request.status() == ApplicationStatus.SHORTLISTED ? "Application Accepted 🎉" : "Application Update";
        String notifBody = "Your application for '" + job.getTitle() + "' at " + job.getCompanyName() + " has been " + statusLabel + ".";

        if (request.status() == ApplicationStatus.SHORTLISTED && request.employerMessage() != null && !request.employerMessage().isBlank()) {
            notifBody += "\n\nMessage from the employer: " + request.employerMessage();
        }

        notificationService.notify(
                application.getApplicantId(),
                org.moseti.kedevsapi.shared.enums.NotificationCategory.JOB,
                notifTitle,
                notifBody,
                "{\"jobId\":\"" + jobId + "\",\"applicationId\":\"" + application.getId() + "\"}"
        );

        return toJobApplicationResponse(application);
    }

    public byte[] getApplicationResume(UUID userId, UUID jobId, UUID applicationId) {
        JobApplication application = jobApplicationRepository.findByJobIdAndId(jobId, applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        JobPost job = application.getJobPost();
        if (!job.getPostedById().equals(userId) && !application.getApplicantId().equals(userId)) {
            throw new ForbiddenException("Not authorized to download this file");
        }

        return downloadFromCloudinary(application.getResumeUrl());
    }

    public byte[] getApplicationCoverLetter(UUID userId, UUID jobId, UUID applicationId) {
        JobApplication application = jobApplicationRepository.findByJobIdAndId(jobId, applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        if (application.getCoverLetterUrl() == null) {
            throw new ResourceNotFoundException("Cover letter file not found");
        }

        JobPost job = application.getJobPost();
        if (!job.getPostedById().equals(userId) && !application.getApplicantId().equals(userId)) {
            throw new ForbiddenException("Not authorized to download this file");
        }

        return downloadFromCloudinary(application.getCoverLetterUrl());
    }

    private byte[] downloadFromCloudinary(String url) {
        if (url == null || url.isBlank()) {
            throw new BadRequestException("Invalid file URL");
        }
        return webClientBuilder.build()
                .get()
                .uri(url)
                .retrieve()
                .bodyToMono(byte[].class)
                .block();
    }

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public Page<JobApplicationResponse> getMyApplications(UUID userId, Pageable pageable) {
        return jobApplicationRepository.findByApplicantId(userId, pageable)
                .map(this::toJobApplicationResponse);
    }

    @Transactional
    public void addTag(UUID userId, UUID jobId, String tag) {
        JobPost job = jobPostRepository.findById(jobId)
                .orElseThrow(() -> new JobNotFoundException("Job not found"));

        if (!job.getPostedById().equals(userId)) {
            throw new ForbiddenException("Not authorized to add tags");
        }

        JobTag jobTag = new JobTag();
        jobTag.setJobPost(job);
        jobTag.setTag(tag);
        jobTagRepository.save(jobTag);
    }

    @Transactional
    public void removeTag(UUID userId, UUID jobId, String tag) {
        JobPost job = jobPostRepository.findById(jobId)
                .orElseThrow(() -> new JobNotFoundException("Job not found"));

        if (!job.getPostedById().equals(userId)) {
            throw new ForbiddenException("Not authorized to remove tags");
        }

        jobTagRepository.deleteByJobIdAndTag(jobId, tag);
    }

    private JobPostResponse toJobPostResponse(JobPost job, UUID currentUserId) {
        String posterName = userRepository.findById(job.getPostedById())
                .map(User::getFullName)
                .orElse("Unknown");

        Role postedByRole = userRepository.findById(job.getPostedById())
                .map(User::getRole)
                .orElse(Role.DEVELOPER);

        boolean hasApplied = false;
        VoteType currentUserVote = null;
        Integer applicationCount = null;

        if (currentUserId != null) {
            hasApplied = jobApplicationRepository.existsByJobIdAndApplicantId(job.getId(), currentUserId);
            currentUserVote = jobVoteRepository.findByJobIdAndUserId(job.getId(), currentUserId)
                    .map(JobVote::getVoteType)
                    .orElse(null);

            if (job.getPostedById().equals(currentUserId)) {
                applicationCount = (int) jobApplicationRepository.findByJobId(job.getId(), Pageable.unpaged()).getTotalElements();
            }
        }

        List<String> tags = jobTagRepository.findByJobId(job.getId())
                .stream().map(JobTag::getTag).toList();

        String posterEmail = userRepository.findById(job.getPostedById())
                .map(User::getEmail)
                .orElse("Unknown");

        return new JobPostResponse(
                job.getId(),
                job.getPostedById(),
                posterName,
                posterEmail,
                job.getTitle(),
                job.getSummary(),
                job.getDescription(),
                job.getCompanyName(),
                job.getLocationCity(),
                job.getLocationCountry(),
                job.getJobType(),
                job.getWorkType(),
                job.getExperienceLevel(),
                job.getMinQualification(),
                job.getMinExperienceYears(),
                job.getSalaryRangeMin(),
                job.getSalaryRangeMax(),
                job.getSalaryCurrency(),
                job.getApplicationDeadline(),
                job.getSourceUrl(),
                job.isPeerSourced(),
                job.getVisibility(),
                job.getStatus(),
                job.getUpvoteCount(),
                job.isFlagged(),
                tags,
                job.getCreatedAt(),
                job.getUpdatedAt(),
                hasApplied,
                currentUserVote,
                applicationCount,
                postedByRole
        );
    }

    private JobSummaryResponse toJobSummaryResponse(JobPost job) {
        Role postedByRole = userRepository.findById(job.getPostedById())
                .map(User::getRole)
                .orElse(Role.DEVELOPER);

        List<String> tags = jobTagRepository.findByJobId(job.getId())
                .stream().map(JobTag::getTag).toList();

        return new JobSummaryResponse(
                job.getId(),
                job.getTitle(),
                job.getCompanyName(),
                job.getLocationCity(),
                job.getLocationCountry(),
                job.getJobType(),
                job.getWorkType(),
                job.getExperienceLevel(),
                job.getVisibility(),
                job.getStatus(),
                job.getUpvoteCount(),
                job.isPeerSourced(),
                job.getSourceUrl(),
                tags,
                job.getCreatedAt(),
                postedByRole
        );
    }

    private JobApplicationResponse toJobApplicationResponse(JobApplication application) {
        User applicant = userRepository.findById(application.getApplicantId()).orElse(null);
        String applicantName = applicant != null ? applicant.getFullName() : "Unknown";
        String applicantEmail = applicant != null ? applicant.getEmail() : "Unknown";
        String applicantProfileImage = null;
        String jobTitle = application.getJobPost() != null ? application.getJobPost().getTitle() : null;
        String companyName = application.getJobPost() != null ? application.getJobPost().getCompanyName() : null;

        // Resolve developer profile ID (not user ID) for proper frontend linking
        UUID applicantProfileId = developerProfileRepository.findByUserId(application.getApplicantId())
                .map(p -> p.getId())
                .orElse(null);

        String coverLetterUrl = application.getCoverLetterUrl() != null 
                ? apiBaseUrl + "/api/v1/jobs/" + application.getJobPost().getId() + "/applications/" + application.getId() + "/cover-letter"
                : null;
        String resumeUrl = application.getResumeUrl() != null
                ? apiBaseUrl + "/api/v1/jobs/" + application.getJobPost().getId() + "/applications/" + application.getId() + "/resume"
                : null;

        return new JobApplicationResponse(
                application.getId(),
                application.getJobPost() != null ? application.getJobPost().getId() : null,
                jobTitle,
                companyName,
                application.getApplicantId(),
                applicantProfileId,
                applicantName,
                applicantEmail,
                applicantProfileImage,
                application.getCoverLetter(),
                coverLetterUrl,
                resumeUrl,
                application.getStatus(),
                application.getCreatedAt(),
                application.getUpdatedAt()
        );
    }
}
