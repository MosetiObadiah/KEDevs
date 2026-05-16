package org.moseti.kedevsapi.admin.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.moseti.kedevsapi.admin.dto.AdminDtos.*;
import org.moseti.kedevsapi.admin.service.AdminService;
import org.moseti.kedevsapi.shared.enums.AccountStatus;
import org.moseti.kedevsapi.shared.enums.CommentFlagStatus;
import org.moseti.kedevsapi.shared.enums.FlagStatus;
import org.moseti.kedevsapi.shared.enums.PaymentStatus;
import org.moseti.kedevsapi.shared.enums.Role;
import org.moseti.kedevsapi.shared.enums.UserFlagStatus;
import org.moseti.kedevsapi.payments.service.PaymentService;
import org.moseti.kedevsapi.payments.dto.PaymentDtos.PaymentResponse;
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
@Tag(name = "Admin")
public class AdminController {

    private final AdminService adminService;
    private final PaymentService paymentService;

    // --- Dashboard & Analytics ---

    @Operation(summary = "Admin: get dashboard summary analytics")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Dashboard data retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT"),
        @ApiResponse(responseCode = "403", description = "Insufficient permissions")
    })
    @GetMapping("/dashboard")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<AnalyticsSummaryResponse>> getDashboard() {
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Dashboard data retrieved", adminService.getAnalyticsSummary()));
    }

    @Operation(summary = "Admin: get signup trends for a period")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Signup trends retrieved successfully")
    })
    @GetMapping("/dashboard/signups")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<List<SignupTrendResponse>>> getSignupTrends(@Parameter(description = "Number of days to look back") @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Signup trends retrieved", adminService.getSignupTrends(days)));
    }

    @Operation(summary = "Admin: get revenue breakdown")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Revenue breakdown retrieved successfully")
    })
    @GetMapping("/dashboard/revenue")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<RevenueBreakdownResponse>> getRevenueBreakdown() {
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Revenue breakdown retrieved", adminService.getRevenueBreakdown()));
    }

    @Operation(summary = "Admin: get revenue trends over time")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Revenue trends retrieved successfully")
    })
    @GetMapping("/dashboard/revenue/trends")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<List<RevenueTrendResponse>>> getRevenueTrends(@RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Revenue trends retrieved", adminService.getRevenueTrends(days)));
    }


    @Operation(summary = "Admin: get forum activity metrics")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Forum activity retrieved successfully")
    })
    @GetMapping("/dashboard/forum")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<ForumActivityResponse>> getForumActivity() {
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Forum activity retrieved", adminService.getForumActivity()));
    }

    @Operation(summary = "Admin: get flagged content summary")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Flagged content summary retrieved successfully")
    })
    @GetMapping("/dashboard/flags")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<FlaggedContentSummaryResponse>> getFlaggedSummary() {
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Flagged content summary retrieved", adminService.getFlaggedContentSummary()));
    }

    // --- User Management ---

    @Operation(summary = "Admin: list all users with filters")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Users retrieved successfully")
    })
    @GetMapping("/users")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<Page<UserSummaryResponse>>> getAllUsers(
            @Parameter(description = "Filter by role") @RequestParam(required = false) Role role,
            @Parameter(description = "Filter by account status") @RequestParam(required = false) AccountStatus status,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Users retrieved", adminService.getAllUsers(role, status, pageable)));
    }

    @Operation(summary = "Admin: get user details by ID")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "User retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "User not found")
    })
    @GetMapping("/users/{id}")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<UserSummaryResponse>> getUserById(@Parameter(description = "ID of the user") @PathVariable UUID id) {
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("User retrieved", adminService.getUserById(id)));
    }

    @Operation(summary = "Admin: perform action on a user (warn/ban/etc)")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "User action performed successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid action or validation error"),
        @ApiResponse(responseCode = "404", description = "User not found")
    })
    @PostMapping("/users/{id}/action")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<Void>> performUserAction(
            @Parameter(description = "ID of the user") @PathVariable UUID id,
            @Valid @RequestBody UserActionRequest request) {
        adminService.performUserAction(getCurrentAdminId(), id, request);
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("User action performed successfully"));
    }

    @Operation(summary = "Admin: list employers awaiting approval")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Pending employers retrieved successfully")
    })
    @GetMapping("/users/pending-employers")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<Page<PendingEmployerResponse>>> getPendingEmployers(@PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Pending employers retrieved", adminService.getPendingEmployers(pageable)));
    }

    @Operation(summary = "Admin: approve or reject an employer profile")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Employer approval processed successfully"),
        @ApiResponse(responseCode = "404", description = "Employer profile not found")
    })
    @PatchMapping("/employers/{profileId}/approval")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<Void>> approveEmployer(
            @Parameter(description = "ID of the employer profile") @PathVariable UUID profileId,
            @Valid @RequestBody ApproveEmployerRequest request) {
        adminService.approveEmployer(getCurrentAdminId(), profileId, request);
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Employer approval processed"));
    }

    @Operation(summary = "Admin: list verification documents awaiting review")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Pending verifications retrieved successfully")
    })
    @GetMapping("/verification/requests")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<Page<VerificationRequestAdminResponse>>> getPendingVerifications(
            @RequestParam(required = false) Role role,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Pending verifications retrieved", adminService.getPendingVerificationRequests(role, pageable)));
    }

    @Operation(summary = "Admin: approve or reject user verification documents")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Verification reviewed successfully"),
        @ApiResponse(responseCode = "404", description = "Request not found")
    })
    @PostMapping("/verification/requests/{requestId}/review")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<Void>> reviewVerification(
            @PathVariable UUID requestId,
            @Valid @RequestBody VerificationReviewRequest request) {
        adminService.reviewVerificationRequest(getCurrentAdminId(), requestId, request);
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Verification reviewed successfully"));
    }

    @Operation(summary = "Admin: retrieve complete verification lifecycle history")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "History load successful")
    })
    @GetMapping("/verification/history")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<Page<VerificationRequestAdminResponse>>> getVerificationHistory(
            @PageableDefault(size = 20, sort = "createdAt", direction = org.springframework.data.domain.Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Lifecycle history fetched", adminService.getVerificationHistory(pageable)));
    }

    @Operation(summary = "Admin: generate and stream physical validation report (CSV/PDF)")
    @GetMapping("/verification/export")
    public ResponseEntity<org.springframework.core.io.Resource> exportVerification(
            @RequestParam String format) {
        byte[] fileBytes = adminService.generateVerificationExport(format);
        
        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        String filename = "verification-report." + format.toLowerCase();
        headers.add(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename);
        
        org.springframework.http.MediaType mediaType = "csv".equalsIgnoreCase(format) 
                ? org.springframework.http.MediaType.parseMediaType("text/csv")
                : org.springframework.http.MediaType.APPLICATION_PDF;

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(mediaType)
                .body(new org.springframework.core.io.ByteArrayResource(fileBytes));
    }

    // --- Flagged Content ---

    @Operation(summary = "Admin: list flagged job posts")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Flagged jobs retrieved successfully")
    })
    @GetMapping("/flags/jobs")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<Page<FlaggedJobResponse>>> getFlaggedJobs(
            @Parameter(description = "Filter by flag status") @RequestParam(required = false) FlagStatus status,
            @RequestParam(defaultValue = "false") boolean history,
            @PageableDefault Pageable pageable) {
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Flagged jobs retrieved", adminService.getFlaggedJobs(status, history, pageable)));
    }

    @Operation(summary = "Admin: review a job flag")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Job flag review processed successfully"),
        @ApiResponse(responseCode = "404", description = "Flag entry not found")
    })
    @PostMapping("/flags/jobs/{flagId}/review")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<Void>> reviewJobFlag(
            @Parameter(description = "ID of the job flag") @PathVariable UUID flagId,
            @Valid @RequestBody ReviewJobFlagRequest request) {
        adminService.reviewJobFlag(getCurrentAdminId(), flagId, request);
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Job flag review processed"));
    }

    @Operation(summary = "Admin: list flagged users")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Flagged users retrieved successfully")
    })
    @GetMapping("/flags/users")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<Page<FlaggedUserResponse>>> getFlaggedUsers(
            @Parameter(description = "Filter by user flag status") @RequestParam(required = false) UserFlagStatus status,
            @RequestParam(defaultValue = "false") boolean history,
            @PageableDefault Pageable pageable) {
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Flagged users retrieved", adminService.getFlaggedUsers(status, history, pageable)));
    }

    @Operation(summary = "Admin: review a user flag")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "User flag review processed successfully"),
        @ApiResponse(responseCode = "404", description = "Flag entry not found")
    })
    @PostMapping("/flags/users/{flagId}/review")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<Void>> reviewUserFlag(
            @Parameter(description = "ID of the user flag") @PathVariable UUID flagId,
            @Valid @RequestBody ReviewUserFlagRequest request) {
        adminService.reviewUserFlag(getCurrentAdminId(), flagId, request);
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("User flag review processed"));
    }

    @Operation(summary = "Admin: list flagged comments")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Flagged comments retrieved successfully")
    })
    @GetMapping("/flags/comments")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<Page<FlaggedCommentResponse>>> getFlaggedComments(
            @Parameter(description = "Filter by comment flag status") @RequestParam(required = false) CommentFlagStatus status,
            @RequestParam(defaultValue = "false") boolean history,
            @PageableDefault Pageable pageable) {
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Flagged comments retrieved", adminService.getFlaggedComments(status, history, pageable)));
    }

    @Operation(summary = "Admin: review a comment flag")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Comment flag review processed successfully"),
        @ApiResponse(responseCode = "404", description = "Flag entry not found")
    })
    @PostMapping("/flags/comments/{flagId}/review")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<Void>> reviewCommentFlag(
            @Parameter(description = "ID of the comment flag") @PathVariable UUID flagId,
            @Valid @RequestBody ReviewCommentFlagRequest request) {
        adminService.reviewCommentFlag(getCurrentAdminId(), flagId, request);
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Comment flag review processed"));
    }

    // --- Badge Management ---

    @Operation(summary = "Admin: grant or revoke a verified badge")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Badge action performed successfully"),
        @ApiResponse(responseCode = "404", description = "User not found")
    })
    @PostMapping("/users/{userId}/badge")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<Void>> performBadgeAction(
            @Parameter(description = "ID of the user") @PathVariable UUID userId,
            @Valid @RequestBody BadgeActionRequest request) {
        adminService.performBadgeAction(getCurrentAdminId(), userId, request);
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Badge action performed successfully"));
    }

    // --- Platform Settings ---

    @Operation(summary = "Admin: list all platform pricing settings")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Settings retrieved successfully")
    })
    @GetMapping("/settings")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<List<PlatformSettingResponse>>> getSettings() {
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Settings retrieved", adminService.getPlatformSettings()));
    }

    @Operation(summary = "Admin: update a platform setting")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Setting updated successfully"),
        @ApiResponse(responseCode = "404", description = "Setting key not found")
    })
    @PutMapping("/settings/{key}")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<PlatformSettingResponse>> updateSetting(
            @Parameter(description = "Key of the setting") @PathVariable String key,
            @Valid @RequestBody UpdateSettingRequest request) {
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Setting updated", adminService.updatePlatformSetting(getCurrentAdminId(), key, request)));
    }

    // --- Payments ---

    @Operation(summary = "Admin: list all platform payments with optional status filter")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Payments retrieved successfully")
    })
    @GetMapping("/payments")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<org.springframework.data.domain.Page<PaymentResponse>>> getAllPayments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) PaymentStatus status) {
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success(
                "Payments retrieved", paymentService.getAllPayments(page, size, status)));
    }

    @Operation(summary = "Admin: view recent administrative actions")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Admin action log retrieved successfully")
    })
    @GetMapping("/actions")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<Page<AdminActionResponse>>> getActionLog(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Admin action log retrieved", adminService.getAdminActionLog(pageable)));
    }

    @Operation(summary = "Admin: get filterable audit log of all administrative actions")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Audit log retrieved successfully")
    })
    @GetMapping("/audit")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<Page<AdminActionResponse>>> getAuditLog(
            @PageableDefault(size = 25, sort = "createdAt", direction = org.springframework.data.domain.Sort.Direction.DESC) Pageable pageable,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) UUID actorId) {
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success(
                "Audit log retrieved", adminService.getFilteredActionLog(action, actorId, pageable)));
    }

    private UUID getCurrentAdminId() {
        return (UUID) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}
