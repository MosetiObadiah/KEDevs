package org.moseti.kedevsapi.payments.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.moseti.kedevsapi.payments.dto.PaymentDtos.*;
import org.moseti.kedevsapi.payments.entity.Payment;
import org.moseti.kedevsapi.payments.service.PaymentService;
import org.moseti.kedevsapi.users.service.CsvExportService;
import org.moseti.kedevsapi.users.service.PdfExportService;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
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
    private final CsvExportService csvExportService;
    private final PdfExportService pdfExportService;

    private UUID getCurrentUserId() {
        org.springframework.security.core.Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            throw new org.moseti.kedevsapi.shared.exception.BadRequestException("Authentication required");
        }
        Object principal = auth.getPrincipal();
        if (principal instanceof UUID) {
            return (UUID) principal;
        }
        if (principal instanceof String) {
            return UUID.fromString((String) principal);
        }
        throw new org.moseti.kedevsapi.shared.exception.BadRequestException("Invalid authentication principal");
    }

    // ====================== Verified Badge ======================

    @Operation(summary = "Initiate M-Pesa STK push for verified badge")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "STK push initiated successfully"),
        @ApiResponse(responseCode = "400", description = "User already verified"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT")
    })
    @PostMapping("/verified-badge")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<PaymentInitiationResponse>> initiateVerifiedBadge(
            @Valid @RequestBody InitiatePaymentRequest request) {
        PaymentInitiationResponse response = paymentService.initiateVerifiedBadge(
                getCurrentUserId(), request.phoneNumber());
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("STK push initiated", response));
    }

    // ====================== Spotlight ======================

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

    @Operation(summary = "Manually confirm a pending spotlight payment",
               description = "Finds the most recent pending spotlight payment and activates the slot. Dev use only.")
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

    // ====================== Pinned Job ======================

    @Operation(summary = "Initiate M-Pesa STK push to pin a job post")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "STK push initiated successfully"),
        @ApiResponse(responseCode = "400", description = "Job already pinned, peer-sourced, or not owned by user"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT"),
        @ApiResponse(responseCode = "403", description = "Not the job owner")
    })
    @PostMapping("/pinned-job")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<PaymentInitiationResponse>> initiatePinnedJob(
            @Valid @RequestBody InitiatePinnedJobRequest request) {
        PaymentInitiationResponse response = paymentService.initiatePinnedJob(
                getCurrentUserId(), request.jobId(), request.durationType(), request.phoneNumber());
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("STK push initiated", response));
    }

    @Operation(summary = "[ADMIN/DEV] Manually confirm a pending pinned-job payment",
               description = "Dev escape hatch — activates pinned status without a real M-Pesa callback. Restricted to ADMIN role.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Pinned job activated"),
        @ApiResponse(responseCode = "400", description = "No pending pinned job payment found"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT"),
        @ApiResponse(responseCode = "403", description = "Admin role required")
    })
    @PostMapping("/confirm-pinned-job")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<Void>> confirmPinnedJob() {
        paymentService.confirmPinnedJob(getCurrentUserId());
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Pinned job activated"));
    }

    // ====================== Daraja Callback ======================

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

    // ====================== Query ======================

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

    @Operation(summary = "Get payment status by Daraja checkout ID")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Payment status fetched successfully"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT"),
        @ApiResponse(responseCode = "403", description = "Not authorized to view this payment"),
        @ApiResponse(responseCode = "404", description = "Payment not found")
    })
    @GetMapping("/status/{checkoutRequestId}")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<PaymentResponse>> getPaymentStatus(
            @PathVariable String checkoutRequestId) {
        PaymentResponse response = paymentService.getPaymentStatusByCheckoutId(getCurrentUserId(), checkoutRequestId);
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Payment status fetched", response));
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

    @Operation(summary = "Export payment history")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "File exported successfully"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT")
    })
    @GetMapping("/export")
    public ResponseEntity<Resource> exportPayments(@RequestParam String format) {
        UUID userId = getCurrentUserId();
        List<Payment> payments = paymentService.findByUserIdOrderByCreatedAtDesc(userId);

        if ("csv".equalsIgnoreCase(format)) {
            byte[] csv = csvExportService.generatePaymentCsv(payments);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=payments.csv")
                    .contentType(MediaType.parseMediaType("text/csv"))
                    .body(new ByteArrayResource(csv));
        } else if ("pdf".equalsIgnoreCase(format)) {
            byte[] pdf = pdfExportService.generatePaymentPdf(payments);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=payments.pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(new ByteArrayResource(pdf));
        }

        return ResponseEntity.badRequest().build();
    }

    @Operation(summary = "Export individual payment receipt")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Receipt exported successfully"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT"),
        @ApiResponse(responseCode = "403", description = "Not authorized to view this payment"),
        @ApiResponse(responseCode = "404", description = "Payment not found")
    })
    @GetMapping("/{id}/receipt/pdf")
    public ResponseEntity<byte[]> exportPaymentReceipt(@PathVariable UUID id) {
        Payment payment = paymentService.getPaymentEntityByIdAndUserId(id, getCurrentUserId());
        byte[] pdf = pdfExportService.generatePaymentReceiptPdf(payment);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"receipt_" + payment.getMpesaReceiptNo() + ".pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}
