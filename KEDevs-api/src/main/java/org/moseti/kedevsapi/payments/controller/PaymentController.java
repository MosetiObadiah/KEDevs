package org.moseti.kedevsapi.payments.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.moseti.kedevsapi.payments.dto.PaymentDtos.*;
import org.moseti.kedevsapi.payments.service.PaymentService;
import org.moseti.kedevsapi.shared.dto.ApiResponse;
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
public class PaymentController {

    private final PaymentService paymentService;

    private UUID getCurrentUserId() {
        return (UUID) Objects.requireNonNull(SecurityContextHolder.getContext().getAuthentication()).getPrincipal();
    }

    @PostMapping("/annual-membership")
    public ResponseEntity<ApiResponse<PaymentInitiationResponse>> initiateAnnualMembership(
            @Valid @RequestBody InitiatePaymentRequest request) {
        PaymentInitiationResponse response = paymentService.initiateAnnualMembership(
                getCurrentUserId(), request.phoneNumber());
        return ResponseEntity.ok(ApiResponse.success("STK push initiated", response));
    }

    @PostMapping("/pro-upgrade")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<ApiResponse<PaymentInitiationResponse>> initiateProUpgrade(
            @Valid @RequestBody InitiatePaymentRequest request) {
        PaymentInitiationResponse response = paymentService.initiateProUpgrade(
                getCurrentUserId(), request.phoneNumber());
        return ResponseEntity.ok(ApiResponse.success("STK push initiated", response));
    }

    @PostMapping("/verified-badge")
    public ResponseEntity<ApiResponse<PaymentInitiationResponse>> initiateVerifiedBadge(
            @Valid @RequestBody InitiatePaymentRequest request) {
        PaymentInitiationResponse response = paymentService.initiateVerifiedBadge(
                getCurrentUserId(), request.phoneNumber());
        return ResponseEntity.ok(ApiResponse.success("STK push initiated", response));
    }

    @PostMapping("/spotlight")
    @PreAuthorize("hasRole('DEVELOPER')")
    public ResponseEntity<ApiResponse<PaymentInitiationResponse>> initiateSpotlight(
            @Valid @RequestBody InitiateSpotlightRequest request) {
        PaymentInitiationResponse response = paymentService.initiateSpotlight(
                getCurrentUserId(), request.phoneNumber(), request.spotlightType());
        return ResponseEntity.ok(ApiResponse.success("STK push initiated", response));
    }

    @PostMapping("/search-token")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<ApiResponse<PaymentInitiationResponse>> initiateSearchToken(
            @Valid @RequestBody InitiatePaymentRequest request) {
        PaymentInitiationResponse response = paymentService.initiateSearchToken(
                getCurrentUserId(), request.phoneNumber());
        return ResponseEntity.ok(ApiResponse.success("STK push initiated", response));
    }

    // PUBLIC — Daraja calls this endpoint without JWT
    @PostMapping("/callback")
    public ResponseEntity<ApiResponse<Void>> handleCallback(
            @RequestBody DarajaCallbackRequest callback) {
        paymentService.handleCallback(callback);
        return ResponseEntity.ok(ApiResponse.success("Callback processed"));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<Page<PaymentResponse>>> getPaymentHistory(
            @PageableDefault(size = 10) Pageable pageable) {
        Page<PaymentResponse> response = paymentService.getPaymentHistory(getCurrentUserId(), pageable);
        return ResponseEntity.ok(ApiResponse.success("Payment history fetched", response));
    }

    @GetMapping("/subscriptions")
    public ResponseEntity<ApiResponse<SubscriptionStatusResponse>> getSubscriptionStatus() {
        SubscriptionStatusResponse response = paymentService.getSubscriptionStatus(getCurrentUserId());
        return ResponseEntity.ok(ApiResponse.success("Subscription status fetched", response));
    }

    // PUBLIC — frontend needs prices for display
    @GetMapping("/settings")
    public ResponseEntity<ApiResponse<List<PlatformSettingResponse>>> getPlatformSettings() {
        List<PlatformSettingResponse> settings = paymentService.getPlatformSettings();
        return ResponseEntity.ok(ApiResponse.success("Platform settings fetched", settings));
    }
}
