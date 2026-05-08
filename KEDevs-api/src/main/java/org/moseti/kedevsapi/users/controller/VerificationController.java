package org.moseti.kedevsapi.users.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.moseti.kedevsapi.shared.dto.ApiResponse;
import org.moseti.kedevsapi.users.dto.VerificationDtos.*;
import org.moseti.kedevsapi.users.service.VerificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/verification")
@RequiredArgsConstructor
@Tag(name = "Verification", description = "Endpoints for profile verification process")
public class VerificationController {

    private final VerificationService verificationService;

    @GetMapping("/status")
    @Operation(summary = "Get current user's verification status")
    public ResponseEntity<ApiResponse<VerificationStatusResponse>> getStatus(@AuthenticationPrincipal UUID userId) {
        return ResponseEntity.ok(ApiResponse.success("Status retrieved", verificationService.getStatus(userId)));
    }

    @PostMapping("/initiate")
    @Operation(summary = "Initiate verification process by paying KES 200")
    public ResponseEntity<ApiResponse<InitiateVerificationResponse>> initiate(@AuthenticationPrincipal UUID userId, 
                                                                              @RequestParam String phoneNumber) {
        return ResponseEntity.ok(ApiResponse.success("Verification initiated", verificationService.initiateVerification(userId, phoneNumber)));
    }

    @PostMapping(value = "/submit-documents", consumes = "multipart/form-data")
    @Operation(summary = "Upload verification documents")
    public ResponseEntity<ApiResponse<Void>> submitDocuments(
            @AuthenticationPrincipal UUID userId,
            @RequestPart(value = "idDoc", required = false) MultipartFile idDoc,
            @RequestPart(value = "passportPhoto", required = false) MultipartFile passportPhoto,
            @RequestPart(value = "certificates", required = false) List<MultipartFile> certificates) {
        
        verificationService.submitDocuments(userId, idDoc, passportPhoto, certificates);
        return ResponseEntity.ok(ApiResponse.success("Documents submitted successfully", null));
    }
}
