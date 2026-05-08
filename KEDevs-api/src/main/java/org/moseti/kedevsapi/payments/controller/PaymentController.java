package org.moseti.kedevsapi.payments.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.moseti.kedevsapi.payments.dto.PaymentDtos.*;
import org.moseti.kedevsapi.payments.service.PaymentService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Tag(name = "Payments")
public class PaymentController {

    private final PaymentService paymentService;

    private UUID getCurrentUserId() {
        return (UUID) Objects.requireNonNull(SecurityContextHolder.getContext().getAuthentication()).getPrincipal();
    }

    @Operation(summary = "Initiate M-Pesa STK push for annual membership")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "STK push initiated successfully"),
        @ApiResponse(responseCode = "400", description = "User already has an active membership"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT")
    })
    @PostMapping("/annual-membership")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<PaymentInitiationResponse>> initiateAnnualMembership(
            @Valid @RequestBody InitiatePaymentRequest request) {
        PaymentInitiationResponse response = paymentService.initiateAnnualMembership(
                getCurrentUserId(), request.phoneNumber());
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("STK push initiated", response));
    }

    @Operation(summary = "Initiate M-Pesa STK push for Employer Pro", description = "Requires EMPLOYER role.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "STK push initiated successfully"),
        @ApiResponse(responseCode = "400", description = "Employer already has a Pro account"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT"),
        @ApiResponse(responseCode = "403", description = "Insufficient permissions")
    })
    @PostMapping("/pro-upgrade")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<PaymentInitiationResponse>> initiateProUpgrade(
            @Valid @RequestBody InitiatePaymentRequest request) {
        PaymentInitiationResponse response = paymentService.initiateProUpgrade(
                getCurrentUserId(), request.phoneNumber());
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("STK push initiated", response));
    }

    @Operation(summary = "Initiate M-Pesa STK push for verified badge")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "STK push initiated successfully"),
        @ApiResponse(responseCode = "400", description = "Developer already verified"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT")
    })
    @PostMapping("/verified-badge")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<PaymentInitiationResponse>> initiateVerifiedBadge(
            @Valid @RequestBody InitiatePaymentRequest request) {
        PaymentInitiationResponse response = paymentService.initiateVerifiedBadge(
                getCurrentUserId(), request.phoneNumber());
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("STK push initiated", response));
    }

    @Operation(summary = "Initiate M-Pesa STK push for Day or Week spotlight", description = "Requires DEVELOPER role.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "STK push initiated successfully"),
        @ApiResponse(responseCode = "400", description = "Requested slot is already taken"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT"),
        @ApiResponse(responseCode = "403", description = "Insufficient permissions")
    })
    @PostMapping("/spotlight")
    @PreAuthorize("hasRole('DEVELOPER')")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<PaymentInitiationResponse>> initiateSpotlight(
            @Valid @RequestBody InitiateSpotlightRequest request) {
        PaymentInitiationResponse response = paymentService.initiateSpotlight(
                getCurrentUserId(), request.phoneNumber(), request.spotlightType());
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("STK push initiated", response));
    }

    @Operation(summary = "Initiate M-Pesa STK push for a search token pack (3 uses)", description = "Requires EMPLOYER role.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "STK push initiated successfully"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT"),
        @ApiResponse(responseCode = "403", description = "Insufficient permissions")
    })
    @PostMapping("/search-token")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<PaymentInitiationResponse>> initiateSearchToken(
            @Valid @RequestBody InitiatePaymentRequest request) {
        PaymentInitiationResponse response = paymentService.initiateSearchToken(
                getCurrentUserId(), request.phoneNumber());
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("STK push initiated", response));
    }

    @Operation(summary = "Daraja M-Pesa payment webhook", 
               description = "Called by Safaricom only. Idempotent — safe to retry.",
               security = {})
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Callback processed successfully")
    })
    @PostMapping("/callback")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<Void>> handleCallback(
            @RequestBody DarajaCallbackRequest callback) {
        paymentService.handleCallback(callback);
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Callback processed"));
    }

    @Operation(summary = "Get own payment history")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Payment history fetched successfully"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT")
    })
    @GetMapping("/history")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<Page<PaymentResponse>>> getPaymentHistory(
            @PageableDefault(size = 10) Pageable pageable) {
        Page<PaymentResponse> response = paymentService.getPaymentHistory(getCurrentUserId(), pageable);
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Payment history fetched", response));
    }

    @Operation(summary = "Get own active subscriptions")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Subscription status fetched successfully"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT")
    })
    @GetMapping("/subscriptions")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<SubscriptionStatusResponse>> getSubscriptionStatus() {
        SubscriptionStatusResponse response = paymentService.getSubscriptionStatus(getCurrentUserId());
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Subscription status fetched", response));
    }

    @Operation(summary = "Get platform pricing settings", security = {})
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Platform settings fetched successfully")
    })
    @GetMapping("/settings")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<List<PlatformSettingResponse>>> getPlatformSettings() {
        List<PlatformSettingResponse> settings = paymentService.getPlatformSettings();
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Platform settings fetched", settings));
    }
    @Operation(summary = "Manually confirm a pending spotlight payment",
               description = "Finds the most recent pending spotlight payment for the current user and activates the slot. Use this if the M-Pesa callback did not arrive (e.g., in local development). Requires DEVELOPER role.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Spotlight slot activated"),
        @ApiResponse(responseCode = "400", description = "No pending spotlight payment found"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT"),
        @ApiResponse(responseCode = "403", description = "Insufficient permissions")
    })
    @PostMapping("/confirm-spotlight")
    @PreAuthorize("hasRole('DEVELOPER')")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<SpotlightSlotConfirmResponse>> confirmSpotlight() {
        SpotlightSlotConfirmResponse response = paymentService.confirmSpotlight(getCurrentUserId());
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Spotlight activated", response));
    }
}
