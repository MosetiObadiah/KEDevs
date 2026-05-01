package org.moseti.kedevsapi.jobs.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.moseti.kedevsapi.jobs.dto.JobDtos.*;
import org.moseti.kedevsapi.jobs.service.JobService;
import org.moseti.kedevsapi.shared.dto.ApiResponse;
import org.moseti.kedevsapi.shared.enums.JobStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/jobs")
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;

    private UUID getCurrentUserId() {
        return (UUID) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    @PostMapping
    public ResponseEntity<ApiResponse<JobPostResponse>> createJobPost(
            @Valid @RequestBody CreateJobPostRequest request) {
        JobPostResponse response = jobService.createJobPost(getCurrentUserId(), request);
        return ResponseEntity.ok(ApiResponse.success("Job post created successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<JobSummaryResponse>>> getJobFeed(
            @ModelAttribute JobSearchRequest request,
            @PageableDefault(size = 10) Pageable pageable) {
        Page<JobSummaryResponse> response = jobService.getJobFeed(request, pageable, getCurrentUserId());
        return ResponseEntity.ok(ApiResponse.success("Job feed fetched", response));
    }

    @GetMapping("/external")
    public ResponseEntity<ApiResponse<Page<JobSummaryResponse>>> getExternalJobs(
            @PageableDefault(size = 10) Pageable pageable) {
        Page<JobSummaryResponse> response = jobService.getExternalJobs(pageable);
        return ResponseEntity.ok(ApiResponse.success("External jobs fetched", response));
    }

    @GetMapping("/my-posts")
    public ResponseEntity<ApiResponse<Page<JobSummaryResponse>>> getMyJobPosts(
            @PageableDefault(size = 10) Pageable pageable) {
        Page<JobSummaryResponse> response = jobService.getMyJobPosts(getCurrentUserId(), pageable);
        return ResponseEntity.ok(ApiResponse.success("My job posts fetched", response));
    }

    @PreAuthorize("hasRole('DEVELOPER')")
    @GetMapping("/my-applications")
    public ResponseEntity<ApiResponse<Page<JobApplicationResponse>>> getMyApplications(
            @PageableDefault(size = 10) Pageable pageable) {
        Page<JobApplicationResponse> response = jobService.getMyApplications(getCurrentUserId(), pageable);
        return ResponseEntity.ok(ApiResponse.success("My applications fetched", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<JobPostResponse>> getJobPost(
            @PathVariable UUID id) {
        JobPostResponse response = jobService.getJobPost(id, getCurrentUserId());
        return ResponseEntity.ok(ApiResponse.success("Job post fetched", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<JobPostResponse>> updateJobPost(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateJobPostRequest request) {
        JobPostResponse response = jobService.updateJobPost(getCurrentUserId(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Job post updated", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteJobPost(
            @PathVariable UUID id) {
        jobService.deleteJobPost(getCurrentUserId(), id);
        return ResponseEntity.ok(ApiResponse.success("Job post deleted"));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<JobPostResponse>> updateJobStatus(
            @PathVariable UUID id,
            @RequestParam JobStatus status) {
        JobPostResponse response = jobService.updateJobStatus(getCurrentUserId(), id, status);
        return ResponseEntity.ok(ApiResponse.success("Job status updated", response));
    }

    @PostMapping("/{id}/vote")
    public ResponseEntity<ApiResponse<Void>> voteOnJob(
            @PathVariable UUID id,
            @Valid @RequestBody VoteRequest request) {
        jobService.voteOnJob(getCurrentUserId(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Vote registered"));
    }

    @PostMapping("/{id}/flag")
    public ResponseEntity<ApiResponse<Void>> flagJob(
            @PathVariable UUID id,
            @Valid @RequestBody FlagJobRequest request) {
        jobService.flagJob(getCurrentUserId(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Job flagged"));
    }

    @PreAuthorize("hasRole('DEVELOPER')")
    @PostMapping("/{id}/apply")
    public ResponseEntity<ApiResponse<JobApplicationResponse>> applyToJob(
            @PathVariable UUID id,
            @Valid @RequestBody ApplyJobRequest request) {
        JobApplicationResponse response = jobService.applyToJob(getCurrentUserId(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Applied to job successfully", response));
    }

    @GetMapping("/{id}/applications")
    public ResponseEntity<ApiResponse<Page<JobApplicationResponse>>> getJobApplications(
            @PathVariable UUID id,
            @PageableDefault(size = 10) Pageable pageable) {
        Page<JobApplicationResponse> response = jobService.getJobApplications(getCurrentUserId(), id, pageable);
        return ResponseEntity.ok(ApiResponse.success("Applications fetched", response));
    }

    @PatchMapping("/{id}/applications/{appId}")
    public ResponseEntity<ApiResponse<JobApplicationResponse>> updateApplicationStatus(
            @PathVariable UUID id,
            @PathVariable UUID appId,
            @Valid @RequestBody UpdateApplicationStatusRequest request) {
        JobApplicationResponse response = jobService.updateApplicationStatus(getCurrentUserId(), id, appId, request);
        return ResponseEntity.ok(ApiResponse.success("Application status updated", response));
    }
}
