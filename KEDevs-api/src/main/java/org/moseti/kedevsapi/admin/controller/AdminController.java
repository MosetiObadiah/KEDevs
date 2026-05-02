package org.moseti.kedevsapi.admin.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.moseti.kedevsapi.admin.dto.AdminDtos.*;
import org.moseti.kedevsapi.admin.service.AdminService;
import org.moseti.kedevsapi.shared.dto.ApiResponse;
import org.moseti.kedevsapi.shared.enums.AccountStatus;
import org.moseti.kedevsapi.shared.enums.CommentFlagStatus;
import org.moseti.kedevsapi.shared.enums.FlagStatus;
import org.moseti.kedevsapi.shared.enums.Role;
import org.moseti.kedevsapi.shared.enums.UserFlagStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    // --- Dashboard & Analytics ---

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<AnalyticsSummaryResponse>> getDashboard() {
        return ResponseEntity.ok(ApiResponse.success("Dashboard data retrieved", adminService.getAnalyticsSummary()));
    }

    @GetMapping("/dashboard/signups")
    public ResponseEntity<ApiResponse<List<SignupTrendResponse>>> getSignupTrends(@RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(ApiResponse.success("Signup trends retrieved", adminService.getSignupTrends(days)));
    }

    @GetMapping("/dashboard/revenue")
    public ResponseEntity<ApiResponse<RevenueBreakdownResponse>> getRevenueBreakdown() {
        return ResponseEntity.ok(ApiResponse.success("Revenue breakdown retrieved", adminService.getRevenueBreakdown()));
    }

    @GetMapping("/dashboard/subscriptions")
    public ResponseEntity<ApiResponse<SubscriptionStatsResponse>> getSubscriptionStats() {
        return ResponseEntity.ok(ApiResponse.success("Subscription stats retrieved", adminService.getSubscriptionStats()));
    }

    @GetMapping("/dashboard/forum")
    public ResponseEntity<ApiResponse<ForumActivityResponse>> getForumActivity() {
        return ResponseEntity.ok(ApiResponse.success("Forum activity retrieved", adminService.getForumActivity()));
    }

    @GetMapping("/dashboard/flags")
    public ResponseEntity<ApiResponse<FlaggedContentSummaryResponse>> getFlaggedSummary() {
        return ResponseEntity.ok(ApiResponse.success("Flagged content summary retrieved", adminService.getFlaggedContentSummary()));
    }

    // --- User Management ---

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<Page<UserSummaryResponse>>> getAllUsers(
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) AccountStatus status,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success("Users retrieved", adminService.getAllUsers(role, status, pageable)));
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<ApiResponse<UserSummaryResponse>> getUserById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success("User retrieved", adminService.getUserById(id)));
    }

    @PostMapping("/users/{id}/action")
    public ResponseEntity<ApiResponse<Void>> performUserAction(
            @PathVariable UUID id,
            @Valid @RequestBody UserActionRequest request) {
        adminService.performUserAction(getCurrentAdminId(), id, request);
        return ResponseEntity.ok(ApiResponse.success("User action performed successfully"));
    }

    @GetMapping("/users/pending-employers")
    public ResponseEntity<ApiResponse<Page<PendingEmployerResponse>>> getPendingEmployers(@PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success("Pending employers retrieved", adminService.getPendingEmployers(pageable)));
    }

    @PostMapping("/employers/{profileId}/approve")
    public ResponseEntity<ApiResponse<Void>> approveEmployer(
            @PathVariable UUID profileId,
            @Valid @RequestBody ApproveEmployerRequest request) {
        adminService.approveEmployer(getCurrentAdminId(), profileId, request);
        return ResponseEntity.ok(ApiResponse.success("Employer approval processed"));
    }

    // --- Flagged Content ---

    @GetMapping("/flags/jobs")
    public ResponseEntity<ApiResponse<Page<FlaggedJobResponse>>> getFlaggedJobs(
            @RequestParam(required = false) FlagStatus status,
            @PageableDefault Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success("Flagged jobs retrieved", adminService.getFlaggedJobs(status, pageable)));
    }

    @PostMapping("/flags/jobs/{flagId}/review")
    public ResponseEntity<ApiResponse<Void>> reviewJobFlag(
            @PathVariable UUID flagId,
            @Valid @RequestBody ReviewJobFlagRequest request) {
        adminService.reviewJobFlag(getCurrentAdminId(), flagId, request);
        return ResponseEntity.ok(ApiResponse.success("Job flag review processed"));
    }

    @GetMapping("/flags/users")
    public ResponseEntity<ApiResponse<Page<FlaggedUserResponse>>> getFlaggedUsers(
            @RequestParam(required = false) UserFlagStatus status,
            @PageableDefault Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success("Flagged users retrieved", adminService.getFlaggedUsers(status, pageable)));
    }

    @PostMapping("/flags/users/{flagId}/review")
    public ResponseEntity<ApiResponse<Void>> reviewUserFlag(
            @PathVariable UUID flagId,
            @Valid @RequestBody ReviewUserFlagRequest request) {
        adminService.reviewUserFlag(getCurrentAdminId(), flagId, request);
        return ResponseEntity.ok(ApiResponse.success("User flag review processed"));
    }

    @GetMapping("/flags/comments")
    public ResponseEntity<ApiResponse<Page<FlaggedCommentResponse>>> getFlaggedComments(
            @RequestParam(required = false) CommentFlagStatus status,
            @PageableDefault Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success("Flagged comments retrieved", adminService.getFlaggedComments(status, pageable)));
    }

    @PostMapping("/flags/comments/{flagId}/review")
    public ResponseEntity<ApiResponse<Void>> reviewCommentFlag(
            @PathVariable UUID flagId,
            @Valid @RequestBody ReviewCommentFlagRequest request) {
        adminService.reviewCommentFlag(getCurrentAdminId(), flagId, request);
        return ResponseEntity.ok(ApiResponse.success("Comment flag review processed"));
    }

    // --- Badge Management ---

    @PostMapping("/users/{userId}/badge")
    public ResponseEntity<ApiResponse<Void>> performBadgeAction(
            @PathVariable UUID userId,
            @Valid @RequestBody BadgeActionRequest request) {
        adminService.performBadgeAction(getCurrentAdminId(), userId, request);
        return ResponseEntity.ok(ApiResponse.success("Badge action performed successfully"));
    }

    // --- Platform Settings ---

    @GetMapping("/settings")
    public ResponseEntity<ApiResponse<List<PlatformSettingResponse>>> getSettings() {
        return ResponseEntity.ok(ApiResponse.success("Settings retrieved", adminService.getPlatformSettings()));
    }

    @PutMapping("/settings/{key}")
    public ResponseEntity<ApiResponse<PlatformSettingResponse>> updateSetting(
            @PathVariable String key,
            @Valid @RequestBody UpdateSettingRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Setting updated", adminService.updatePlatformSetting(getCurrentAdminId(), key, request)));
    }

    // --- Audit Log ---

    @GetMapping("/actions")
    public ResponseEntity<ApiResponse<Page<AdminActionResponse>>> getActionLog(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success("Admin action log retrieved", adminService.getAdminActionLog(pageable)));
    }

    private UUID getCurrentAdminId() {
        return (UUID) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}
