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
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
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
    private final org.moseti.kedevsapi.users.repository.EmployerProfileRepository employerProfileRepository;
    private final EmployerProfileService employerProfileService;
    private final FileUploadService fileUploadService;
    private final org.moseti.kedevsapi.notifications.service.NotificationService notificationService;
    private final org.moseti.kedevsapi.auth.service.EmailService emailService;
    private final org.moseti.kedevsapi.users.service.PdfExportService pdfExportService;
    private final org.moseti.kedevsapi.payments.repository.PlatformSettingRepository platformSettingRepository;
    private final CacheManager cacheManager;


    @Value("${app.api-base-url:http://localhost:8080}")
    private String apiBaseUrl;

    @Value("${cloudinary.cloud-name:}")
    private String cloudinaryCloudName;

    @Value("${cloudinary.api-key:}")
    private String cloudinaryApiKey;

    @Value("${cloudinary.api-secret:}")
    private String cloudinaryApiSecret;

    private com.cloudinary.Cloudinary cloudinaryInstance;

    @jakarta.annotation.PostConstruct
    public void init() {
        if (cloudinaryCloudName != null && !cloudinaryCloudName.isBlank() &&
                cloudinaryApiKey != null && !cloudinaryApiKey.isBlank() &&
                cloudinaryApiSecret != null && !cloudinaryApiSecret.isBlank()) {
            this.cloudinaryInstance = new com.cloudinary.Cloudinary(com.cloudinary.utils.ObjectUtils.asMap(
                    "cloud_name", cloudinaryCloudName,
                    "api_key", cloudinaryApiKey,
                    "api_secret", cloudinaryApiSecret));
            log.info("JobService pre-cached Cloudinary configurations successfully.");
        } else {
            log.warn("Cloudinary credentials are missing or empty in JobService.");
        }
    }

    public byte[] exportJobsToPdf(JobSearchRequest request, UUID currentUserId) {
        // Reuse the same logic as getJobFeed but without pagination (fetch all
        // matching)
        Page<JobSummaryResponse> jobsPage = getJobFeed(request, Pageable.unpaged(), currentUserId);
        List<JobSummaryResponse> jobs = jobsPage.getContent();

        String generatedBy = "Guest User";
        if (currentUserId != null) {
            generatedBy = userRepository.findById(currentUserId).map(User::getFullName).orElse("Unknown User");
        }

        return pdfExportService.generateJobPdf(jobs, request, generatedBy);
    }

    public JobFilterMetadataResponse getFilterMetadata() {
        return new JobFilterMetadataResponse(
                jobPostRepository.findUniqueQualifications(),
                jobPostRepository.findUniqueExperienceYears());
    }

    @Transactional
    @CacheEvict(value = "publicJobs", allEntries = true)
    public JobPostResponse createJobPost(UUID userId, CreateJobPostRequest request) {
        if (userId == null) {
            throw new org.moseti.kedevsapi.shared.exception.UnauthorizedException(
                    "User context is missing or unauthenticated");
        }
        if (request.salaryRangeMin() != null && request.salaryRangeMax() != null && request.salaryRangeMax().compareTo(request.salaryRangeMin()) < 0) {
            throw new BadRequestException("Maximum salary cannot be smaller than minimum salary");
        }
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

    private JobSummaryResponse withUserContext(JobSummaryResponse base, UUID currentUserId) {
        if (currentUserId == null) {
            return base;
        }
        VoteType currentUserVote = jobVoteRepository.findByJobIdAndUserId(base.id(), currentUserId)
                .map(org.moseti.kedevsapi.jobs.entity.JobVote::getVoteType)
                .orElse(null);
        String flagStatus = resolveFlagStatus(base.id(), currentUserId);
        boolean isCurrentUserFlagged = "PENDING".equals(flagStatus);
        
        return new JobSummaryResponse(
                base.id(), base.title(), base.companyName(), base.locationCity(), base.locationCountry(),
                base.jobType(), base.workType(), base.experienceLevel(), base.salaryRangeMin(), base.salaryRangeMax(),
                base.visibility(), base.status(), base.upvoteCount(), base.isFlagged(), base.isPeerSourced(),
                base.sourceUrl(), base.tags(), base.applicationDeadline(), base.createdAt(), base.postedByRole(),
                base.isPinned(), base.pinnedUntil(), currentUserVote, isCurrentUserFlagged, flagStatus
        );
    }

    @SuppressWarnings("unchecked")
    public List<JobSummaryResponse> getPublicJobsList() {
        Cache cache = cacheManager.getCache("publicJobs");
        if (cache != null) {
            try {
                Cache.ValueWrapper wrapper = cache.get("all");
                if (wrapper != null) {
                    return (List<JobSummaryResponse>) wrapper.get();
                }
            } catch (Exception e) {
                log.error("Failed to deserialize publicJobs cache. Evicting and falling back to database.", e);
                try {
                    cache.evict("all");
                } catch (Exception ex) {
                    log.error("Failed to evict publicJobs key from cache", ex);
                }
            }
        }


        List<JobSummaryResponse> list = jobPostRepository.findActivePublicJobs(
                JobVisibility.PUBLIC, JobStatus.OPEN, null, java.time.LocalDate.now(), Pageable.unpaged())
                .getContent()
                .stream()
                .map(this::toJobSummaryResponse)
                .toList();

        if (cache != null) {
            cache.put("all", list);
        }
        return list;
    }

    public Page<JobSummaryResponse> getPublicJobs(UUID postedById, Pageable pageable, UUID currentUserId) {
        if (postedById != null) {
            return jobPostRepository.findActivePublicJobs(
                    JobVisibility.PUBLIC, JobStatus.OPEN, postedById, java.time.LocalDate.now(), pageable)
                    .map(job -> toJobSummaryResponse(job, currentUserId));
        }

        List<JobSummaryResponse> allJobs = getPublicJobsList();

        List<JobSummaryResponse> enriched = allJobs.stream()
                .map(job -> withUserContext(job, currentUserId))
                .toList();

        int start = (int) pageable.getOffset();
        if (start >= enriched.size()) {
            return new PageImpl<>(List.of(), pageable, enriched.size());
        }
        int end = Math.min(start + pageable.getPageSize(), enriched.size());
        return new PageImpl<>(enriched.subList(start, end), pageable, enriched.size());
    }


    public Page<JobSummaryResponse> getJobFeed(JobSearchRequest request, Pageable pageable, UUID currentUserId) {
        Specification<JobPost> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Public board strictly enforces active public positions only
            predicates.add(cb.equal(root.get("visibility"), JobVisibility.PUBLIC));
            predicates.add(cb.equal(root.get("status"), JobStatus.OPEN));

            java.time.LocalDate today = java.time.LocalDate.now();
            predicates.add(cb.or(
                    cb.isNull(root.get("applicationDeadline")),
                    cb.greaterThanOrEqualTo(root.get("applicationDeadline"), today)
            ));

            if (request.keyword() != null && !request.keyword().trim().isEmpty()) {
                String pattern = "%" + request.keyword().trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("title")), pattern),
                        cb.like(cb.lower(root.get("description")), pattern)));
            }

            if (request.locationCity() != null && !request.locationCity().trim().isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("locationCity")),
                        "%" + request.locationCity().trim().toLowerCase() + "%"));
            }

            if (request.locationCountry() != null && !request.locationCountry().trim().isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("locationCountry")),
                        "%" + request.locationCountry().trim().toLowerCase() + "%"));
            }

            if (request.jobTypes() != null && !request.jobTypes().isEmpty()) {
                predicates.add(root.get("jobType").in(request.jobTypes()));
            }

            if (request.workTypes() != null && !request.workTypes().isEmpty()) {
                predicates.add(root.get("workType").in(request.workTypes()));
            }

            if (request.experienceLevels() != null && !request.experienceLevels().isEmpty()) {
                predicates.add(root.get("experienceLevel").in(request.experienceLevels()));
            }

            if (request.minSalary() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("salaryRangeMin"), request.minSalary()));
            }

            if (request.maxSalary() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("salaryRangeMax"), request.maxSalary()));
            }

            if (request.minQualification() != null && !request.minQualification().trim().isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("minQualification")),
                        "%" + request.minQualification().trim().toLowerCase() + "%"));
            }

            if (request.minExperienceYears() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("minExperienceYears"), request.minExperienceYears()));
            }

            if (request.deadlineFrom() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("applicationDeadline"), request.deadlineFrom()));
            }

            if (request.deadlineTo() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("applicationDeadline"), request.deadlineTo()));
            }

            if (request.isPeerSourced() != null) {
                predicates.add(cb.equal(root.get("isPeerSourced"), request.isPeerSourced()));
            }

            if (request.minUpvotes() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("upvoteCount"), request.minUpvotes()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return jobPostRepository.findAll(spec, pageable)
                .map(job -> toJobSummaryResponse(job, currentUserId));
    }

    public Page<JobSummaryResponse> getMyJobPosts(UUID userId, Pageable pageable) {
        return jobPostRepository.findByPostedById(userId, pageable)
                .map(job -> toJobSummaryResponse(job, userId));
    }

    @Transactional
    @CacheEvict(value = "publicJobs", allEntries = true)
    public JobPostResponse updateJobPost(UUID userId, UUID jobId, UpdateJobPostRequest request) {
        JobPost job = jobPostRepository.findById(jobId)
                .orElseThrow(() -> new JobNotFoundException("Job not found"));

        if (!job.getPostedById().equals(userId)) {
            throw new ForbiddenException("Not authorized to update this job");
        }

        if (job.getStatus() == JobStatus.CLOSED || job.getStatus() == JobStatus.REMOVED) {
            throw new BadRequestException("Cannot edit a closed or removed job posting");
        }

        java.math.BigDecimal finalMin = request.salaryRangeMin() != null ? request.salaryRangeMin() : job.getSalaryRangeMin();
        java.math.BigDecimal finalMax = request.salaryRangeMax() != null ? request.salaryRangeMax() : job.getSalaryRangeMax();
        if (finalMin != null && finalMax != null && finalMax.compareTo(finalMin) < 0) {
            throw new BadRequestException("Maximum salary cannot be smaller than minimum salary");
        }

        if (request.title() != null)
            job.setTitle(request.title());
        if (request.summary() != null)
            job.setSummary(request.summary());
        if (request.description() != null)
            job.setDescription(request.description());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getRole() == Role.EMPLOYER) {
            // Employers cannot make jobs peer sourced
            job.setPeerSourced(false);
            job.setSourceUrl(null);

            // If they provided a company name, ignore it and keep the one set on creation
            // or profile
            if (request.companyName() != null) {
                try {
                    var profile = employerProfileService.getProfileByUserId(userId);
                    job.setCompanyName(profile.companyName());
                } catch (Exception e) {
                    // Fallback to existing
                }
            }
        } else {
            if (request.companyName() != null)
                job.setCompanyName(request.companyName());
            if (request.sourceUrl() != null)
                job.setSourceUrl(request.sourceUrl());
            if (request.isPeerSourced() != null)
                job.setPeerSourced(request.isPeerSourced());
        }

        if (request.locationCity() != null)
            job.setLocationCity(request.locationCity());
        if (request.locationCountry() != null)
            job.setLocationCountry(request.locationCountry());
        if (request.jobType() != null)
            job.setJobType(request.jobType());
        if (request.workType() != null)
            job.setWorkType(request.workType());
        if (request.experienceLevel() != null)
            job.setExperienceLevel(request.experienceLevel());
        if (request.minQualification() != null)
            job.setMinQualification(request.minQualification());
        if (request.minExperienceYears() != null)
            job.setMinExperienceYears(request.minExperienceYears());
        if (request.salaryRangeMin() != null)
            job.setSalaryRangeMin(request.salaryRangeMin());
        if (request.salaryRangeMax() != null)
            job.setSalaryRangeMax(request.salaryRangeMax());
        if (request.salaryCurrency() != null)
            job.setSalaryCurrency(request.salaryCurrency());
        if (request.applicationDeadline() != null)
            job.setApplicationDeadline(request.applicationDeadline());

        if (request.visibility() != null)
            job.setVisibility(request.visibility());

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
    @CacheEvict(value = "publicJobs", allEntries = true)
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
    @CacheEvict(value = "publicJobs", allEntries = true)
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
                    "{\"jobId\":\"" + jobId + "\"}");
            emailService.sendJobFlaggedEmail(admin.getEmail(), job.getTitle(), reporterName, request.reason());
        }
    }

    @Transactional
    public JobApplicationResponse applyToJob(UUID userId, UUID jobId, MultipartFile resume,
            MultipartFile coverLetterFile, String coverLetterText) {
        JobPost job = jobPostRepository.findById(jobId)
                .orElseThrow(() -> new JobNotFoundException("Job not found"));

        if (job.isPeerSourced()) {
            throw new BadRequestException("Peer-sourced jobs must be applied externally");
        }

        if (job.getStatus() != JobStatus.OPEN) {
            throw new JobNotOpenException("Job is not open for applications");
        }

        if (job.isFlagged()) {
            throw new BadRequestException("This job is currently under review and cannot accept applications");
        }

        if (job.getPostedById().equals(userId)) {
            throw new CannotApplyToOwnJobException("Cannot apply to your own job");
        }

        if (jobApplicationRepository.existsByJobIdAndApplicantId(jobId, userId)) {
            throw new AlreadyAppliedException("Already applied to this job");
        }

        // Verify applicant is not marked as NOT_AVAILABLE
        org.moseti.kedevsapi.users.entity.DeveloperProfile devProfile = developerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Developer profile not found"));
        if (devProfile.getAvailabilityStatus() == AvailabilityStatus.NOT_AVAILABLE) {
            throw new BadRequestException(
                    "You are currently marked as Not Available. Update your status to apply for jobs.");
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
                    "{\"jobId\":\"" + jobId + "\",\"applicationId\":\"" + application.getId() + "\"}");
            emailService.sendJobApplicationEmail(poster.getEmail(), poster.getFullName(), job.getTitle(),
                    applicant.getFullName());
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
    public JobApplicationResponse updateApplicationStatus(UUID userId, UUID jobId, UUID applicationId,
            UpdateApplicationStatusRequest request) {
        JobPost job = jobPostRepository.findById(jobId)
                .orElseThrow(() -> new JobNotFoundException("Job not found"));

        if (!job.getPostedById().equals(userId)) {
            throw new ForbiddenException("Not authorized to update this application");
        }

        JobApplication application = jobApplicationRepository.findByJobIdAndId(jobId, applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        application.setStatus(request.status());
        if (request.employerMessage() != null) {
            application.setEmployerMessage(request.employerMessage());
        }
        application = jobApplicationRepository.save(application);

        String statusLabel = switch (request.status()) {
            case SHORTLISTED -> "accepted";
            case REJECTED -> "not moved forward with at this time";
            case VIEWED -> "reviewed";
            default -> request.status().name().toLowerCase();
        };

        String notifTitle = request.status() == ApplicationStatus.SHORTLISTED ? "Application Accepted"
                : (request.status() == ApplicationStatus.REJECTED ? "Application Rejected ✗" : "Application Update");
        String notifBody = "Your application for '" + job.getTitle() + "' at " + job.getCompanyName() + " has been "
                + statusLabel + ".";

        if (request.employerMessage() != null && !request.employerMessage().isBlank()) {
            notifBody += "\n\nMessage from the employer: " + request.employerMessage();
        }

        notificationService.notify(
                application.getApplicantId(),
                org.moseti.kedevsapi.shared.enums.NotificationCategory.JOB,
                notifTitle,
                notifBody,
                "{\"jobId\":\"" + jobId + "\",\"applicationId\":\"" + application.getId() + "\"}");

        return toJobApplicationResponse(application);
    }

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public byte[] getApplicationResume(UUID userId, UUID jobId, UUID applicationId) {
        JobApplication application = jobApplicationRepository.findByJobIdAndId(jobId, applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        JobPost job = application.getJobPost();
        if (!job.getPostedById().equals(userId) && !application.getApplicantId().equals(userId)) {
            throw new ForbiddenException("Not authorized to download this file");
        }

        return downloadFromCloudinary(application.getResumeUrl());
    }

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
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

    private static class CloudinaryUrlParts {
        public final String resourceType;
        public final String deliveryType;
        public final String publicId;
        public final String extension;

        public CloudinaryUrlParts(String resourceType, String deliveryType, String publicId, String extension) {
            this.resourceType = resourceType;
            this.deliveryType = deliveryType;
            this.publicId = publicId;
            this.extension = extension;
        }
    }

    private CloudinaryUrlParts parseCloudinaryUrl(String url) {
        if (url == null || url.isBlank()) {
            return null;
        }
        try {
            String resourceType = null;
            int typeIndex = -1;

            if (url.contains("/image/")) {
                resourceType = "image";
                typeIndex = url.indexOf("/image/");
            } else if (url.contains("/raw/")) {
                resourceType = "raw";
                typeIndex = url.indexOf("/raw/");
            } else if (url.contains("/video/")) {
                resourceType = "video";
                typeIndex = url.indexOf("/video/");
            }

            if (typeIndex == -1) {
                return null;
            }

            int startOfDeliveryType = typeIndex + resourceType.length() + 2;
            int endOfDeliveryType = url.indexOf('/', startOfDeliveryType);
            if (endOfDeliveryType == -1) {
                return null;
            }
            String deliveryType = url.substring(startOfDeliveryType, endOfDeliveryType);

            int startOfPath = endOfDeliveryType + 1;
            String path = url.substring(startOfPath);

            // Skip version segment (e.g. v1234567) if present
            if (path.startsWith("v")) {
                int slashIndex = path.indexOf('/');
                if (slashIndex != -1) {
                    String possibleVersion = path.substring(1, slashIndex);
                    if (possibleVersion.matches("\\d+")) {
                        path = path.substring(slashIndex + 1);
                    }
                }
            }

            int dotIndex = path.lastIndexOf('.');
            if (dotIndex == -1) {
                return null;
            }

            String publicId = path.substring(0, dotIndex);
            String extension = path.substring(dotIndex + 1);

            // Force explicit resource types per document type, ignoring what was in the
            // legacy URL
            if (extension.matches("(?i)pdf|doc|docx")) {
                resourceType = "raw";
            } else if (extension.matches("(?i)jpg|jpeg|png|webp")) {
                resourceType = "image";
            }

            return new CloudinaryUrlParts(resourceType, deliveryType, publicId, extension);
        } catch (Exception e) {
            log.error("Failed to parse Cloudinary URL: {}", url, e);
            return null;
        }
    }

    private byte[] downloadFromCloudinary(String url) {
        if (url == null || url.isBlank()) {
            throw new BadRequestException("Invalid file URL");
        }
        try {
            String downloadUrl = url;
            if (cloudinaryInstance != null) {
                CloudinaryUrlParts parts = parseCloudinaryUrl(url);
                if (parts != null) {
                    try {
                        // Generate a signed temporary download URL using Cloudinary URL builder
                        downloadUrl = cloudinaryInstance.url()
                                .resourceType(parts.resourceType)
                                .type(parts.deliveryType)
                                .secure(true)
                                .signed(true)
                                .format(parts.extension)
                                .generate(parts.publicId);
                        log.info("Generated authenticated private URL for asset download: {}", downloadUrl);
                    } catch (Exception e) {
                        log.warn("Failed to generate private download URL for {}, downloading from fallback URL", url,
                                e);
                    }
                }
            }

            java.net.URL fileUrl = new java.net.URI(downloadUrl).toURL();
            try (java.io.InputStream in = fileUrl.openStream()) {
                return in.readAllBytes();
            }
        } catch (Exception e) {
            log.error("Failed to download file from Cloudinary: {}", url, e);
            throw new RuntimeException("Failed to download file from Cloudinary: " + e.getMessage());
        }
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
        String postedByName = userRepository.findById(job.getPostedById())
                .map(User::getFullName)
                .orElse("Unknown");

        Role postedByRole = userRepository.findById(job.getPostedById())
                .map(User::getRole)
                .orElse(Role.DEVELOPER);
        UUID postedByProfileId = null;
        String postedByCompanyName = null;

        if (postedByRole == Role.DEVELOPER) {
            postedByProfileId = developerProfileRepository.findByUserId(job.getPostedById())
                    .map(org.moseti.kedevsapi.shared.entity.BaseEntity::getId)
                    .orElse(null);
        } else if (postedByRole == Role.EMPLOYER) {
            var employerProfile = employerProfileRepository.findByUserId(job.getPostedById());
            postedByProfileId = employerProfile.map(org.moseti.kedevsapi.shared.entity.BaseEntity::getId).orElse(null);
            postedByCompanyName = employerProfile.map(org.moseti.kedevsapi.users.entity.EmployerProfile::getCompanyName)
                    .orElse(null);
        }

        boolean hasApplied = false;
        VoteType currentUserVote = null;
        Integer applicationCount = null;
        boolean isCurrentUserFlagged = false;
        String flagStatus = "NONE";

        if (currentUserId != null) {
            hasApplied = jobApplicationRepository.existsByJobIdAndApplicantId(job.getId(), currentUserId);
            currentUserVote = jobVoteRepository.findByJobIdAndUserId(job.getId(), currentUserId)
                    .map(JobVote::getVoteType)
                    .orElse(null);
            flagStatus = resolveFlagStatus(job.getId(), currentUserId);
            isCurrentUserFlagged = "PENDING".equals(flagStatus);

            if (job.getPostedById().equals(currentUserId)) {
                applicationCount = (int) jobApplicationRepository.findByJobId(job.getId(), Pageable.unpaged())
                        .getTotalElements();
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
                postedByName,
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
                postedByRole,
                job.isPinned(),
                job.getPinnedUntil(),
                postedByProfileId,
                postedByCompanyName,
                isCurrentUserFlagged,
                flagStatus);
    }

    private JobSummaryResponse toJobSummaryResponse(JobPost job) {
        return toJobSummaryResponse(job, null);
    }

    private JobSummaryResponse toJobSummaryResponse(JobPost job, UUID currentUserId) {
        Role postedByRole = userRepository.findById(job.getPostedById())
                .map(User::getRole)
                .orElse(Role.DEVELOPER);

        List<String> tags = jobTagRepository.findByJobId(job.getId())
                .stream().map(JobTag::getTag).toList();

        VoteType currentUserVote = null;
        boolean isCurrentUserFlagged = false;
        String flagStatus = "NONE";
        if (currentUserId != null) {
            currentUserVote = jobVoteRepository.findByJobIdAndUserId(job.getId(), currentUserId)
                    .map(org.moseti.kedevsapi.jobs.entity.JobVote::getVoteType)
                    .orElse(null);
            flagStatus = resolveFlagStatus(job.getId(), currentUserId);
            isCurrentUserFlagged = "PENDING".equals(flagStatus);
        }

        return new JobSummaryResponse(
                job.getId(),
                job.getTitle(),
                job.getCompanyName(),
                job.getLocationCity(),
                job.getLocationCountry(),
                job.getJobType(),
                job.getWorkType(),
                job.getExperienceLevel(),
                job.getSalaryRangeMin(),
                job.getSalaryRangeMax(),
                job.getVisibility(),
                job.getStatus(),
                job.getUpvoteCount(),
                job.isFlagged(),
                job.isPeerSourced(),
                job.getSourceUrl(),
                tags,
                job.getApplicationDeadline(),
                job.getCreatedAt(),
                postedByRole,
                job.isPinned(),
                job.getPinnedUntil(),
                currentUserVote,
                isCurrentUserFlagged,
                flagStatus);
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
                ? apiBaseUrl + "/api/v1/jobs/" + application.getJobPost().getId() + "/applications/"
                        + application.getId() + "/cover-letter"
                : null;
        String resumeUrl = application.getResumeUrl() != null
                ? apiBaseUrl + "/api/v1/jobs/" + application.getJobPost().getId() + "/applications/"
                        + application.getId() + "/resume"
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
                application.getEmployerMessage(),
                application.getCreatedAt(),
                application.getUpdatedAt());
    }

    /**
     * Returns up to 3 currently active pinned jobs for the /jobs page featured row.
     * Only OPEN jobs with a future pinnedUntil are included.
     */
    public List<PinnedJobSummaryResponse> getPinnedJobs(UUID currentUserId) {
        java.time.LocalDate today = java.time.LocalDate.now();
        return jobPostRepository
                .findByIsPinnedTrueAndPinnedUntilAfterOrderByPinnedUntilDesc(java.time.LocalDateTime.now())
                .stream()
                .filter(job -> job.getStatus() == JobStatus.OPEN && (job.getApplicationDeadline() == null || !job.getApplicationDeadline().isBefore(today)))
                .limit(3)
                .map(job -> {
                    VoteType currentUserVote = null;
                    boolean isCurrentUserFlagged = false;
                    String flagStatus = "NONE";
                    if (currentUserId != null) {
                        currentUserVote = jobVoteRepository.findByJobIdAndUserId(job.getId(), currentUserId)
                                .map(org.moseti.kedevsapi.jobs.entity.JobVote::getVoteType)
                                .orElse(null);
                        flagStatus = resolveFlagStatus(job.getId(), currentUserId);
                        isCurrentUserFlagged = "PENDING".equals(flagStatus);
                    }
                    return new PinnedJobSummaryResponse(
                            job.getId(),
                            job.getTitle(),
                            job.getCompanyName(),
                            job.getLocationCity(),
                            job.getLocationCountry(),
                            job.getWorkType(),
                            job.getJobType(),
                            job.getPinnedUntil(),
                            job.getApplicationDeadline(),
                            job.getSalaryRangeMin(),
                            job.getSalaryCurrency(),
                            job.getCreatedAt(),
                            job.getUpvoteCount(),
                            job.isFlagged(),
                            currentUserVote,
                            isCurrentUserFlagged,
                            flagStatus);
                })
                .toList();
    }

    /**
     * Returns the current availability of the 3 pinned job slots, including
     * which jobs occupy them and the pricing for each duration tier.
     */
    public PinnedSlotAvailabilityResponse getPinnedSlotAvailability() {
        int maxSlots = 3;
        java.time.LocalDate today = java.time.LocalDate.now();
        List<JobPost> activelyPinned = jobPostRepository
                .findByIsPinnedTrueAndPinnedUntilAfterOrderByPinnedUntilDesc(java.time.LocalDateTime.now())
                .stream()
                .filter(job -> job.getStatus() == JobStatus.OPEN && (job.getApplicationDeadline() == null || !job.getApplicationDeadline().isBefore(today)))
                .limit(maxSlots)
                .toList();

        List<PinnedSlotInfo> activeSlots = activelyPinned.stream()
                .map(job -> new PinnedSlotInfo(
                        job.getId(),
                        job.getTitle(),
                        job.getCompanyName(),
                        job.getPinnedUntil()))
                .toList();

        java.math.BigDecimal dayPrice = platformSettingRepository.findBySettingKey("PINNED_JOB_DAY_FEE")
                .map(s -> new java.math.BigDecimal(s.getSettingValue()))
                .orElse(java.math.BigDecimal
                        .valueOf(org.moseti.kedevsapi.shared.util.Constants.DEFAULT_PINNED_JOB_DAY_FEE));
        java.math.BigDecimal threeDaysPrice = platformSettingRepository.findBySettingKey("PINNED_JOB_3DAYS_FEE")
                .map(s -> new java.math.BigDecimal(s.getSettingValue()))
                .orElse(java.math.BigDecimal
                        .valueOf(org.moseti.kedevsapi.shared.util.Constants.DEFAULT_PINNED_JOB_3DAYS_FEE));
        java.math.BigDecimal sevenDaysPrice = platformSettingRepository.findBySettingKey("PINNED_JOB_7DAYS_FEE")
                .map(s -> new java.math.BigDecimal(s.getSettingValue()))
                .orElse(java.math.BigDecimal
                        .valueOf(org.moseti.kedevsapi.shared.util.Constants.DEFAULT_PINNED_JOB_7DAYS_FEE));

        return new PinnedSlotAvailabilityResponse(
                maxSlots,
                activeSlots.size(),
                maxSlots - activeSlots.size(),
                activeSlots,
                dayPrice,
                threeDaysPrice,
                sevenDaysPrice);
    }

    private String resolveFlagStatus(UUID jobId, UUID userId) {
        if (userId == null) {
            return "NONE";
        }
        return jobFlagRepository.findByJobIdAndFlaggedById(jobId, userId)
                .map(flag -> {
                    if (flag.getStatus() == FlagStatus.PENDING) {
                        return "PENDING";
                    } else if (flag.getStatus() == FlagStatus.REVIEWED_KEPT 
                            || flag.getStatus() == FlagStatus.REVIEWED_LEGITIMATE 
                            || flag.getStatus() == FlagStatus.REVIEWED_WARNED) {
                        return "REVIEWED_KEPT";
                    } else if (flag.getStatus() == FlagStatus.REVIEWED_REMOVED) {
                        return "REVIEWED_REMOVED";
                    }
                    return "NONE";
                })
                .orElse("NONE");
    }
}
