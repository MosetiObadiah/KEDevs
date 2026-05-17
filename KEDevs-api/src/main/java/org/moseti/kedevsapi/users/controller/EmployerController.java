package org.moseti.kedevsapi.users.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.moseti.kedevsapi.shared.enums.ContactRequestStatus;
import org.moseti.kedevsapi.users.dto.UserDtos;
import org.moseti.kedevsapi.users.service.EmployerProfileService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/employers")
@RequiredArgsConstructor
@Tag(name = "Employer Profiles")
public class EmployerController {

    private final EmployerProfileService employerProfileService;
    
    // --- Public Profiles ---

    @Operation(summary = "List all approved employer profiles (public)")
    @GetMapping("/public")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<Page<UserDtos.EmployerProfileResponse>>> getPublicProfiles(
            @ModelAttribute UserDtos.EmployerFilterRequest filter,
            @org.springframework.data.web.PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Employer profiles fetched", employerProfileService.getPublicProfiles(filter, pageable)));
    }

    @Operation(summary = "Export filtered employer profiles to PDF")
    @GetMapping("/public/export")
    public ResponseEntity<org.springframework.core.io.Resource> exportEmployersToPdf(
            @ModelAttribute UserDtos.EmployerFilterRequest filter,
            Authentication authentication) {
        UUID currentUserId = authentication != null ? (UUID) authentication.getPrincipal() : null;
        byte[] pdf = employerProfileService.exportEmployersToPdf(filter, currentUserId);
        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"companies_report.pdf\"")
                .contentType(org.springframework.http.MediaType.APPLICATION_PDF)
                .body(new org.springframework.core.io.ByteArrayResource(pdf));
    }

    @Operation(summary = "Get a single employer profile by ID (public)")
    @GetMapping("/public/{id}")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<UserDtos.EmployerProfileResponse>> getPublicProfileById(
            @Parameter(description = "ID of the employer profile") @PathVariable UUID id) {
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Employer profile fetched", employerProfileService.getPublicProfileById(id)));
    }

    @Operation(summary = "Create employer profile", description = "Requires EMPLOYER role.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Profile created successfully"),
        @ApiResponse(responseCode = "400", description = "Profile already exists or validation error"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT"),
        @ApiResponse(responseCode = "403", description = "Insufficient permissions")
    })
    @PostMapping("/profile")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<UserDtos.EmployerProfileResponse>> createProfile(
            Authentication authentication,
            @Valid @RequestBody UserDtos.CreateEmployerProfileRequest request) {
        UUID userId = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Employer profile created",
                employerProfileService.createProfile(userId, request)));
    }

    @Operation(summary = "Get own employer profile", description = "Requires EMPLOYER role.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Profile retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT"),
        @ApiResponse(responseCode = "404", description = "Profile not found")
    })
    @GetMapping("/profile/me")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<UserDtos.EmployerProfileResponse>> getMyProfile(Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Profile retrieved",
                employerProfileService.getProfileByUserId(userId)));
    }

    @Operation(summary = "Update employer profile", description = "Requires EMPLOYER role.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Profile updated successfully"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT"),
        @ApiResponse(responseCode = "404", description = "Profile not found")
    })
    @PutMapping("/profile")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<UserDtos.EmployerProfileResponse>> updateProfile(
            Authentication authentication,
            @Valid @RequestBody UserDtos.UpdateEmployerProfileRequest request) {
        UUID userId = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Profile updated",
                employerProfileService.updateProfile(userId, request)));
    }

    @Operation(summary = "Upload employer company logo", description = "Requires EMPLOYER role.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Logo uploaded successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid or missing image file"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT")
    })
    @PostMapping(value = "/profile/logo", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<UserDtos.EmployerProfileResponse>> uploadLogo(
            Authentication authentication,
            @RequestPart("image") org.springframework.web.multipart.MultipartFile image) {
        UUID userId = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Logo uploaded",
                employerProfileService.uploadLogo(userId, image)));
    }

    @Operation(summary = "Upload company verification documents",
               description = "Uploads Certificate of Incorporation/CR12, KRA PIN Certificate, and Single Business Permit to Cloudinary. Requires EMPLOYER role and an existing profile.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Verification documents uploaded successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid or missing file"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT"),
        @ApiResponse(responseCode = "404", description = "Employer profile not found")
    })
    @PostMapping(value = "/profile/verification-documents", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<UserDtos.EmployerProfileResponse>> uploadVerificationDocuments(
            Authentication authentication,
            @RequestPart("incorporationCertificate") org.springframework.web.multipart.MultipartFile incorporationCertificate,
            @RequestPart("kraPinCertificate") org.springframework.web.multipart.MultipartFile kraPinCertificate,
            @RequestPart("businessPermit") org.springframework.web.multipart.MultipartFile businessPermit) {
        UUID userId = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Verification documents uploaded",
                employerProfileService.uploadVerificationDocuments(userId, incorporationCertificate, kraPinCertificate, businessPermit)));
    }


    @Operation(summary = "Send contact request to developer", description = "Requires authenticated user.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Contact request sent successfully"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT"),
        @ApiResponse(responseCode = "429", description = "Daily contact limit exceeded")
    })
    @PostMapping("/contact/{developerId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<UserDtos.ContactRequestResponse>> sendContactRequest(
            Authentication authentication,
            @Parameter(description = "ID of the developer to contact") @PathVariable UUID developerId,
            @Valid @RequestBody UserDtos.ContactRequestDto request) {
        UUID userId = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Contact request sent",
                employerProfileService.sendContactRequest(userId, developerId, request)));
    }

    @Operation(summary = "List received contact requests", description = "Requires DEVELOPER role.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Contact requests retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT")
    })
    @GetMapping("/contact/requests")
    @PreAuthorize("hasRole('DEVELOPER')")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<Page<UserDtos.ContactRequestResponse>>> getContactRequests(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        UUID userId = (UUID) authentication.getPrincipal();
        Pageable pageable = PageRequest.of(page, Math.min(size, 50));
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Contact requests retrieved",
                employerProfileService.getContactRequests(userId, pageable)));
    }

    @Operation(summary = "Respond to a contact request", description = "Requires DEVELOPER role.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Response recorded successfully"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT"),
        @ApiResponse(responseCode = "404", description = "Contact request not found")
    })
    @PatchMapping("/contact/requests/{id}")
    @PreAuthorize("hasRole('DEVELOPER')")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<UserDtos.ContactRequestResponse>> respondToContactRequest(
            Authentication authentication,
            @Parameter(description = "ID of the contact request") @PathVariable UUID id,
            @RequestParam ContactRequestStatus status) {
        UUID userId = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Response recorded",
                employerProfileService.respondToContactRequest(userId, id, status)));
    }
    @Operation(summary = "Flag an employer profile", description = "Requires authenticated user.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Profile flagged successfully"),
        @ApiResponse(responseCode = "400", description = "Cannot flag own profile or already flagged"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT")
    })
    @PostMapping("/{profileId}/flag")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<Void>> flagEmployer(
            Authentication authentication,
            @Parameter(description = "ID of the employer profile to flag") @PathVariable UUID profileId,
            @Valid @RequestBody UserDtos.FlagUserRequest request) {
        UUID userId = (UUID) authentication.getPrincipal();
        employerProfileService.flagEmployer(userId, profileId, request);
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Employer profile flagged"));
    }

    @Operation(summary = "Send an inquiry to a company profile", description = "Requires authenticated user.")
    @PostMapping("/public/{companyId}/inquire")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<UserDtos.CompanyInquiryResponse>> sendCompanyInquiry(
            Authentication authentication,
            @PathVariable UUID companyId,
            @Valid @RequestBody UserDtos.ContactRequestDto request) {
        UUID userId = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Inquiry sent successfully",
                employerProfileService.sendCompanyInquiry(userId, companyId, request)));
    }

    @Operation(summary = "List received company inquiries", description = "Requires EMPLOYER role.")
    @GetMapping("/inquiries")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<Page<UserDtos.CompanyInquiryResponse>>> getIncomingInquiries(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        UUID userId = (UUID) authentication.getPrincipal();
        Pageable pageable = PageRequest.of(page, Math.min(size, 50));
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Inquiries retrieved successfully",
                employerProfileService.getIncomingInquiries(userId, pageable)));
    }

    @Operation(summary = "Respond to a company inquiry", description = "Requires EMPLOYER role.")
    @PatchMapping("/inquiries/{id}")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<UserDtos.CompanyInquiryResponse>> respondToInquiry(
            Authentication authentication,
            @PathVariable UUID id,
            @RequestParam ContactRequestStatus status) {
        UUID userId = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Response recorded",
                employerProfileService.respondToInquiry(userId, id, status)));
    }
}
