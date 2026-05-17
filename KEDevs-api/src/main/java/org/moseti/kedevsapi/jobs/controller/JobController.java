package org.moseti.kedevsapi.jobs.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.moseti.kedevsapi.jobs.dto.JobDtos.*;
import org.moseti.kedevsapi.jobs.service.JobService;
import org.moseti.kedevsapi.shared.enums.JobStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/jobs")
@RequiredArgsConstructor
@Tag(name = "Jobs")
public class JobController {

    private final JobService jobService;
    private final org.moseti.kedevsapi.jobs.service.SafeBrowsingService safeBrowsingService;

    private UUID getCurrentUserId() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UUID) {
            return (UUID) principal;
        }
        return null;
    }

    @Operation(summary = "Create a job post", description = "Requires authenticated user.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Job post created successfully"),
        @ApiResponse(responseCode = "400", description = "Validation error"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT")
    })
    @PostMapping
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<JobPostResponse>> createJobPost(
            @Valid @RequestBody CreateJobPostRequest request) {
        JobPostResponse response = jobService.createJobPost(getCurrentUserId(), request);
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Job post created successfully", response));
    }

    @Operation(summary = "List internal job posts (paginated)", description = "Requires authenticated user.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Job feed fetched successfully"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT")
    })
    @GetMapping
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<Page<JobSummaryResponse>>> getJobFeed(
            @ModelAttribute JobSearchRequest request,
            @PageableDefault(size = 10) Pageable pageable) {
        Page<JobSummaryResponse> response = jobService.getJobFeed(request, pageable, getCurrentUserId());
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Job feed fetched", response));
    }

    @Operation(summary = "Export filtered job posts to PDF")
    @GetMapping("/export")
    public ResponseEntity<Resource> exportJobsToPdf(
            @ModelAttribute JobSearchRequest request) {
        byte[] pdf = jobService.exportJobsToPdf(request, getCurrentUserId());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"job_listings_report.pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(new ByteArrayResource(pdf));
    }

    @Operation(summary = "Get unique filter values for jobs (qualifications, experience years)")
    @GetMapping("/metadata")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<JobFilterMetadataResponse>> getFilterMetadata() {
        JobFilterMetadataResponse response = jobService.getFilterMetadata();
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Filter metadata fetched", response));
    }

    @Operation(summary = "List public jobs for landing page", security = {})
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Public jobs fetched successfully")
    })
    @GetMapping("/public")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<Page<JobSummaryResponse>>> getPublicJobs(
            @RequestParam(required = false) UUID postedById,
            @PageableDefault(size = 10) Pageable pageable) {
        Page<JobSummaryResponse> response = jobService.getPublicJobs(postedById, pageable);
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Public jobs fetched", response));
    }

    @Operation(summary = "List currently active pinned jobs for the featured section", security = {})
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Pinned jobs fetched successfully")
    })
    @GetMapping("/pinned")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<java.util.List<PinnedJobSummaryResponse>>> getPinnedJobs() {
        java.util.List<PinnedJobSummaryResponse> response = jobService.getPinnedJobs();
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Pinned jobs fetched", response));
    }

    @Operation(summary = "Check pinned job slot availability and pricing", security = {})
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Slot availability fetched successfully")
    })
    @GetMapping("/pinned/slots")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<PinnedSlotAvailabilityResponse>> getPinnedSlotAvailability() {
        PinnedSlotAvailabilityResponse response = jobService.getPinnedSlotAvailability();
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Slot availability fetched", response));
    }

    @Operation(summary = "List own job posts", description = "Requires authenticated user.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "My job posts fetched successfully"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT")
    })
    @GetMapping("/my-posts")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<Page<JobSummaryResponse>>> getMyJobPosts(
            @PageableDefault(size = 10) Pageable pageable) {
        Page<JobSummaryResponse> response = jobService.getMyJobPosts(getCurrentUserId(), pageable);
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("My job posts fetched", response));
    }

    @Operation(summary = "List own job applications", description = "Requires DEVELOPER role.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "My applications fetched successfully"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT"),
        @ApiResponse(responseCode = "403", description = "Insufficient permissions")
    })
    @PreAuthorize("hasRole('DEVELOPER')")
    @GetMapping("/my-applications")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<Page<JobApplicationResponse>>> getMyApplications(
            @PageableDefault(size = 10) Pageable pageable) {
        Page<JobApplicationResponse> response = jobService.getMyApplications(getCurrentUserId(), pageable);
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("My applications fetched", response));
    }

    @Operation(summary = "Get a single job post", description = "Requires authenticated user.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Job post fetched successfully"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT"),
        @ApiResponse(responseCode = "404", description = "Job post not found")
    })
    @GetMapping("/{id}")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<JobPostResponse>> getJobPost(
            @Parameter(description = "ID of the job post") @PathVariable UUID id) {
        JobPostResponse response = jobService.getJobPost(id, getCurrentUserId());
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Job post fetched", response));
    }

    @Operation(summary = "Update a job post", description = "Requires ownership of the post.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Job post updated successfully"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT"),
        @ApiResponse(responseCode = "403", description = "Not the owner of the job post"),
        @ApiResponse(responseCode = "404", description = "Job post not found")
    })
    @PutMapping("/{id}")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<JobPostResponse>> updateJobPost(
            @Parameter(description = "ID of the job post") @PathVariable UUID id,
            @Valid @RequestBody UpdateJobPostRequest request) {
        JobPostResponse response = jobService.updateJobPost(getCurrentUserId(), id, request);
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Job post updated", response));
    }

    @Operation(summary = "Delete a job post", description = "Requires ownership of the post.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Job post deleted successfully"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT"),
        @ApiResponse(responseCode = "403", description = "Not the owner of the job post"),
        @ApiResponse(responseCode = "404", description = "Job post not found")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<Void>> deleteJobPost(
            @Parameter(description = "ID of the job post") @PathVariable UUID id) {
        jobService.deleteJobPost(getCurrentUserId(), id);
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Job post deleted"));
    }

    @Operation(summary = "Update job post status (open/closed)", description = "Requires ownership of the post.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Job status updated successfully"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT"),
        @ApiResponse(responseCode = "403", description = "Not the owner of the job post"),
        @ApiResponse(responseCode = "404", description = "Job post not found")
    })
    @PatchMapping("/{id}/status")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<JobPostResponse>> updateJobStatus(
            @Parameter(description = "ID of the job post") @PathVariable UUID id,
            @RequestParam JobStatus status) {
        JobPostResponse response = jobService.updateJobStatus(getCurrentUserId(), id, status);
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Job status updated", response));
    }

    @Operation(summary = "Toggle upvote/downvote on a job", description = "Requires authenticated user.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Vote registered successfully"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT")
    })
    @PostMapping("/{id}/vote")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<Void>> voteOnJob(
            @Parameter(description = "ID of the job post") @PathVariable UUID id,
            @Valid @RequestBody VoteRequest request) {
        jobService.voteOnJob(getCurrentUserId(), id, request);
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Vote registered"));
    }

    @Operation(summary = "Flag a job as suspicious", description = "Requires authenticated user.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Job flagged successfully"),
        @ApiResponse(responseCode = "400", description = "Cannot flag own job or already flagged"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT")
    })
    @PostMapping("/{id}/flag")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<Void>> flagJob(
            @Parameter(description = "ID of the job post") @PathVariable UUID id,
            @Valid @RequestBody FlagJobRequest request) {
        jobService.flagJob(getCurrentUserId(), id, request);
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Job flagged"));
    }

    @Operation(summary = "Apply to a job", description = "Requires DEVELOPER role. Send as multipart/form-data.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Applied successfully"),
        @ApiResponse(responseCode = "400", description = "Already applied or own job post"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT"),
        @ApiResponse(responseCode = "403", description = "Insufficient permissions")
    })
    @PreAuthorize("hasRole('DEVELOPER')")
    @PostMapping(value = "/{id}/apply", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<JobApplicationResponse>> applyToJob(
            @Parameter(description = "ID of the job post") @PathVariable UUID id,
            @RequestPart(value = "resume", required = true) MultipartFile resume,
            @RequestPart(value = "coverLetter", required = false) MultipartFile coverLetterFile,
            @RequestParam(value = "coverLetterText", required = false) String coverLetterText) {
        JobApplicationResponse response = jobService.applyToJob(getCurrentUserId(), id, resume, coverLetterFile, coverLetterText);
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Applied to job successfully", response));
    }

    @Operation(summary = "List applications for a job", description = "Requires ownership of the post.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Applications fetched successfully"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT"),
        @ApiResponse(responseCode = "403", description = "Not the owner of the job post"),
        @ApiResponse(responseCode = "404", description = "Job post not found")
    })
    @GetMapping("/{id}/applications")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<Page<JobApplicationResponse>>> getJobApplications(
            @Parameter(description = "ID of the job post") @PathVariable UUID id,
            @PageableDefault(size = 10) Pageable pageable) {
        Page<JobApplicationResponse> response = jobService.getJobApplications(getCurrentUserId(), id, pageable);
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Applications fetched", response));
    }

    @Operation(summary = "Update application status", description = "Requires ownership of the job post.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Application status updated successfully"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT"),
        @ApiResponse(responseCode = "403", description = "Not the owner of the job post"),
        @ApiResponse(responseCode = "404", description = "Job post or application not found")
    })
    @PatchMapping("/{id}/applications/{appId}")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<JobApplicationResponse>> updateApplicationStatus(
            @Parameter(description = "ID of the job post") @PathVariable UUID id,
            @Parameter(description = "ID of the application") @PathVariable UUID appId,
            @Valid @RequestBody UpdateApplicationStatusRequest request) {
        JobApplicationResponse response = jobService.updateApplicationStatus(getCurrentUserId(), id, appId, request);
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Application status updated", response));
    }

    @Operation(summary = "Download applicant resume", description = "Proxies file from Cloudinary with auth check.")
    @GetMapping("/{id}/applications/{appId}/resume")
    public ResponseEntity<Resource> downloadResume(
            @PathVariable UUID id,
            @PathVariable UUID appId) {
        byte[] data = jobService.getApplicationResume(getCurrentUserId(), id, appId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"resume_" + appId + ".pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(new ByteArrayResource(data));
    }

    @Operation(summary = "Download applicant cover letter", description = "Proxies file from Cloudinary with auth check.")
    @GetMapping("/{id}/applications/{appId}/cover-letter")
    public ResponseEntity<Resource> downloadCoverLetter(
            @PathVariable UUID id,
            @PathVariable UUID appId) {
        byte[] data = jobService.getApplicationCoverLetter(getCurrentUserId(), id, appId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"cover_letter_" + appId + ".pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(new ByteArrayResource(data));
    }

    @Operation(summary = "Verify external job URL safety via Google Safe Browsing")
    @PostMapping("/verify-url")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<VerifyUrlResponse>> verifyUrl(
            @Valid @RequestBody VerifyUrlRequest request) {
        boolean isSafe = safeBrowsingService.isUrlSafe(request.url());
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Verification completed", new VerifyUrlResponse(isSafe)));
    }

    public record VerifyUrlRequest(
            @jakarta.validation.constraints.NotBlank
            @org.hibernate.validator.constraints.URL(message = "Must be a valid web URL")
            String url
    ) {}
    public record VerifyUrlResponse(boolean isSafe) {}
}
