package org.moseti.kedevsapi.users.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.moseti.kedevsapi.shared.enums.AvailabilityStatus;
import org.moseti.kedevsapi.shared.enums.ProfileVisibility;
import org.moseti.kedevsapi.users.dto.UserDtos;
import org.moseti.kedevsapi.users.service.DeveloperProfileService;
import org.moseti.kedevsapi.users.service.EmployerProfileService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.moseti.kedevsapi.users.service.CsvExportService;
import org.moseti.kedevsapi.users.service.PdfExportService;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/developers")
@RequiredArgsConstructor
@Tag(name = "Developer Profiles")
public class DeveloperController {

    private final DeveloperProfileService developerProfileService;
    private final EmployerProfileService employerProfileService;
    private final CsvExportService csvExportService;
    private final PdfExportService pdfExportService;

    @Operation(summary = "Create developer profile", description = "Requires DEVELOPER role.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Profile created successfully"),
        @ApiResponse(responseCode = "400", description = "Profile already exists or validation error"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT"),
        @ApiResponse(responseCode = "403", description = "Insufficient permissions")
    })
    @PostMapping("/profile")
    @PreAuthorize("hasRole('DEVELOPER')")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<UserDtos.DeveloperProfileResponse>> createProfile(
            Authentication authentication,
            @Valid @RequestBody UserDtos.CreateDeveloperProfileRequest request) {
        UUID userId = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Profile created", developerProfileService.createProfile(userId, request)));
    }

    @Operation(summary = "Get own developer profile", description = "Requires DEVELOPER role.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Profile retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT"),
        @ApiResponse(responseCode = "404", description = "Profile not found")
    })
    @GetMapping("/profile/me")
    @PreAuthorize("hasRole('DEVELOPER')")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<UserDtos.DeveloperProfileResponse>> getMyProfile(Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Profile retrieved", developerProfileService.getProfileByUserId(userId)));
    }

    @Operation(summary = "Get a developer's public profile")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Profile retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT"),
        @ApiResponse(responseCode = "404", description = "Profile not found")
    })
    @GetMapping("/{profileId}")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<UserDtos.DeveloperProfileResponse>> getPublicProfile(
            @Parameter(description = "ID of the developer profile") @PathVariable UUID profileId) {
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Profile retrieved", developerProfileService.getPublicProfile(profileId)));
    }

    @Operation(summary = "Update developer profile", description = "Requires DEVELOPER role.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Profile updated successfully"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT"),
        @ApiResponse(responseCode = "404", description = "Profile not found")
    })
    @PutMapping("/profile")
    @PreAuthorize("hasRole('DEVELOPER')")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<UserDtos.DeveloperProfileResponse>> updateProfile(
            Authentication authentication,
            @Valid @RequestBody UserDtos.UpdateDeveloperProfileRequest request) {
        UUID userId = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Profile updated", developerProfileService.updateProfile(userId, request)));
    }

    @Operation(summary = "Update availability status", description = "Requires DEVELOPER role.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Availability updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid status"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT")
    })
    @PatchMapping("/profile/availability")
    @PreAuthorize("hasRole('DEVELOPER')")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<Void>> toggleAvailability(
            Authentication authentication,
            @RequestParam AvailabilityStatus status) {
        UUID userId = (UUID) authentication.getPrincipal();
        developerProfileService.toggleAvailability(userId, status);
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Availability updated"));
    }

    @Operation(summary = "Update profile visibility", description = "Requires DEVELOPER role.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Visibility updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid visibility setting"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT")
    })
    @PatchMapping("/profile/visibility")
    @PreAuthorize("hasRole('DEVELOPER')")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<Void>> updateVisibility(
            Authentication authentication,
            @RequestParam ProfileVisibility visibility) {
        UUID userId = (UUID) authentication.getPrincipal();
        developerProfileService.updateVisibility(userId, visibility);
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Visibility updated"));
    }

    @Operation(summary = "Add a skill", description = "Requires DEVELOPER role.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Skill added successfully"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT")
    })
    @PostMapping("/profile/skills")
    @PreAuthorize("hasRole('DEVELOPER')")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<Void>> addSkill(
            Authentication authentication,
            @Valid @RequestBody UserDtos.AddSkillRequest request) {
        UUID userId = (UUID) authentication.getPrincipal();
        developerProfileService.addSkill(userId, request.skill());
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Skill added"));
    }

    @Operation(summary = "Remove a skill", description = "Requires DEVELOPER role.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Skill removed successfully"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT"),
        @ApiResponse(responseCode = "404", description = "Skill not found on profile")
    })
    @DeleteMapping("/profile/skills/{skill}")
    @PreAuthorize("hasRole('DEVELOPER')")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<Void>> removeSkill(
            Authentication authentication,
            @Parameter(description = "Name of the skill to remove") @PathVariable String skill) {
        UUID userId = (UUID) authentication.getPrincipal();
        developerProfileService.removeSkill(userId, skill);
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Skill removed"));
    }

    @Operation(summary = "Add a spoken language", description = "Requires DEVELOPER role.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Language added successfully"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT")
    })
    @PostMapping("/profile/languages")
    @PreAuthorize("hasRole('DEVELOPER')")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<Void>> addLanguage(
            Authentication authentication,
            @Valid @RequestBody UserDtos.AddLanguageRequest request) {
        UUID userId = (UUID) authentication.getPrincipal();
        developerProfileService.addLanguage(userId, request.language());
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Language added"));
    }

    @Operation(summary = "Remove a language", description = "Requires DEVELOPER role.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Language removed successfully"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT"),
        @ApiResponse(responseCode = "404", description = "Language not found on profile")
    })
    @DeleteMapping("/profile/languages/{language}")
    @PreAuthorize("hasRole('DEVELOPER')")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<Void>> removeLanguage(
            Authentication authentication,
            @Parameter(description = "Name of the language to remove") @PathVariable String language) {
        UUID userId = (UUID) authentication.getPrincipal();
        developerProfileService.removeLanguage(userId, language);
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Language removed"));
    }

    @Operation(summary = "Add education entry", description = "Requires DEVELOPER role.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Education added successfully"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT")
    })
    @PostMapping("/profile/education")
    @PreAuthorize("hasRole('DEVELOPER')")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<UserDtos.EducationResponse>> addEducation(
            Authentication authentication,
            @Valid @RequestBody UserDtos.AddEducationRequest request) {
        UUID userId = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Education added", developerProfileService.addEducation(userId, request)));
    }

    @Operation(summary = "Delete education entry", description = "Requires DEVELOPER role.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Education deleted successfully"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT"),
        @ApiResponse(responseCode = "404", description = "Education entry not found")
    })
    @DeleteMapping("/profile/education/{id}")
    @PreAuthorize("hasRole('DEVELOPER')")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<Void>> deleteEducation(
            Authentication authentication,
            @Parameter(description = "ID of the education entry") @PathVariable UUID id) {
        UUID userId = (UUID) authentication.getPrincipal();
        developerProfileService.deleteEducation(userId, id);
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Education deleted"));
    }

    @Operation(summary = "Add a certification", description = "Requires DEVELOPER role.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Certification added successfully"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT")
    })
    @PostMapping("/profile/certifications")
    @PreAuthorize("hasRole('DEVELOPER')")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<UserDtos.CertificationResponse>> addCertification(
            Authentication authentication,
            @Valid @RequestBody UserDtos.AddCertificationRequest request) {
        UUID userId = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Certification added", developerProfileService.addCertification(userId, request)));
    }

    @Operation(summary = "Delete a certification", description = "Requires DEVELOPER role.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Certification deleted successfully"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT"),
        @ApiResponse(responseCode = "404", description = "Certification entry not found")
    })
    @DeleteMapping("/profile/certifications/{id}")
    @PreAuthorize("hasRole('DEVELOPER')")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<Void>> deleteCertification(
            Authentication authentication,
            @Parameter(description = "ID of the certification entry") @PathVariable UUID id) {
        UUID userId = (UUID) authentication.getPrincipal();
        developerProfileService.deleteCertification(userId, id);
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Certification deleted"));
    }

    @Operation(summary = "Upload developer profile photo", description = "Requires DEVELOPER role.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Profile photo uploaded successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid or missing image file"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT")
    })
    @PostMapping(value = "/profile/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('DEVELOPER')")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<UserDtos.DeveloperProfileResponse>> uploadProfilePhoto(
            Authentication authentication,
            @RequestPart("image") MultipartFile image) {
        UUID userId = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Profile photo uploaded", developerProfileService.uploadProfilePhoto(userId, image)));
    }

    @Operation(summary = "Upload an image for a certification", description = "Requires DEVELOPER role.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Image uploaded successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid or missing image file"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT"),
        @ApiResponse(responseCode = "404", description = "Certification not found")
    })
    @PostMapping(value = "/profile/certifications/{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('DEVELOPER')")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<UserDtos.CertificationResponse>> uploadCertificationImage(
            Authentication authentication,
            @Parameter(description = "ID of the certification entry") @PathVariable UUID id,
            @RequestPart("image") MultipartFile image) {
        UUID userId = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Image uploaded", developerProfileService.uploadCertificationImage(userId, id, image)));
    }

    @Operation(summary = "Add OSS contribution", description = "Requires DEVELOPER role.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "OSS contribution added successfully"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT")
    })
    @PostMapping("/profile/oss")
    @PreAuthorize("hasRole('DEVELOPER')")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<UserDtos.OssContributionResponse>> addOssContribution(
            Authentication authentication,
            @Valid @RequestBody UserDtos.AddOssContributionRequest request) {
        UUID userId = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("OSS contribution added", developerProfileService.addOssContribution(userId, request)));
    }

    @Operation(summary = "Delete OSS contribution", description = "Requires DEVELOPER role.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "OSS contribution deleted successfully"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT"),
        @ApiResponse(responseCode = "404", description = "OSS entry not found")
    })
    @DeleteMapping("/profile/oss/{id}")
    @PreAuthorize("hasRole('DEVELOPER')")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<Void>> deleteOssContribution(
            Authentication authentication,
            @Parameter(description = "ID of the OSS contribution") @PathVariable UUID id) {
        UUID userId = (UUID) authentication.getPrincipal();
        developerProfileService.deleteOssContribution(userId, id);
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("OSS contribution deleted"));
    }

    @Operation(summary = "Add an achievement", description = "Requires DEVELOPER role.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Achievement added successfully"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT")
    })
    @PostMapping("/profile/achievements")
    @PreAuthorize("hasRole('DEVELOPER')")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<UserDtos.AchievementResponse>> addAchievement(
            Authentication authentication,
            @Valid @RequestBody UserDtos.AddAchievementRequest request) {
        UUID userId = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Achievement added", developerProfileService.addAchievement(userId, request)));
    }

    @Operation(summary = "Delete an achievement", description = "Requires DEVELOPER role.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Achievement deleted successfully"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT"),
        @ApiResponse(responseCode = "404", description = "Achievement entry not found")
    })
    @DeleteMapping("/profile/achievements/{id}")
    @PreAuthorize("hasRole('DEVELOPER')")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<Void>> deleteAchievement(
            Authentication authentication,
            @Parameter(description = "ID of the achievement entry") @PathVariable UUID id) {
        UUID userId = (UUID) authentication.getPrincipal();
        developerProfileService.deleteAchievement(userId, id);
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Achievement deleted"));
    }

    @Operation(summary = "Add a project", description = "Requires DEVELOPER role.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Project added successfully"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT")
    })
    @PostMapping(value = "/profile/projects", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('DEVELOPER')")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<UserDtos.DeveloperProjectResponse>> addProject(
            Authentication authentication,
            @RequestPart("project") @Valid UserDtos.AddProjectRequest request,
            @RequestPart(value = "screenshot", required = false) MultipartFile screenshot) {
        UUID userId = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Project added", developerProfileService.addProject(userId, request, screenshot)));
    }

    @Operation(summary = "Update a project", description = "Requires DEVELOPER role.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Project updated successfully"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT"),
        @ApiResponse(responseCode = "404", description = "Project entry not found")
    })
    @PutMapping(value = "/profile/projects/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('DEVELOPER')")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<UserDtos.DeveloperProjectResponse>> updateProject(
            Authentication authentication,
            @Parameter(description = "ID of the project entry") @PathVariable UUID id,
            @RequestPart("project") @Valid UserDtos.AddProjectRequest request,
            @RequestPart(value = "screenshot", required = false) MultipartFile screenshot) {
        UUID userId = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Project updated", developerProfileService.updateProject(userId, id, request, screenshot)));
    }

    @Operation(summary = "Delete a project", description = "Requires DEVELOPER role.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Project deleted successfully"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT"),
        @ApiResponse(responseCode = "404", description = "Project entry not found")
    })
    @DeleteMapping("/profile/projects/{id}")
    @PreAuthorize("hasRole('DEVELOPER')")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<Void>> deleteProject(
            Authentication authentication,
            @Parameter(description = "ID of the project entry") @PathVariable UUID id) {
        UUID userId = (UUID) authentication.getPrincipal();
        developerProfileService.deleteProject(userId, id);
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Project deleted"));
    }

    @Operation(summary = "Toggle project featured status", description = "Requires DEVELOPER role.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Featured status toggled successfully"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT"),
        @ApiResponse(responseCode = "404", description = "Project entry not found")
    })
    @PatchMapping("/profile/projects/{id}/featured")
    @PreAuthorize("hasRole('DEVELOPER')")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<Void>> toggleFeatured(
            Authentication authentication,
            @Parameter(description = "ID of the project entry") @PathVariable UUID id) {
        UUID userId = (UUID) authentication.getPrincipal();
        developerProfileService.toggleFeatured(userId, id);
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Featured status toggled"));
    }

    @Operation(summary = "Upload a screenshot for a project", description = "Requires DEVELOPER role.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Screenshot uploaded successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid or missing screenshot file"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT"),
        @ApiResponse(responseCode = "404", description = "Project not found")
    })
    @PostMapping(value = "/profile/projects/{id}/screenshot", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('DEVELOPER')")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<UserDtos.DeveloperProjectResponse>> uploadProjectScreenshot(
            Authentication authentication,
            @Parameter(description = "ID of the project entry") @PathVariable UUID id,
            @RequestPart("screenshot") MultipartFile screenshot) {
        UUID userId = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Screenshot uploaded", developerProfileService.uploadProjectScreenshot(userId, id, screenshot)));
    }
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Endorsement added successfully"),
        @ApiResponse(responseCode = "400", description = "Cannot self-endorse"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT")
    })
    @PostMapping("/{profileId}/endorsements")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<UserDtos.EndorsementResponse>> addEndorsement(
            Authentication authentication,
            @Parameter(description = "ID of the developer profile to endorse") @PathVariable UUID profileId,
            @Valid @RequestBody UserDtos.CreateEndorsementRequest request) {
        UUID userId = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Endorsement added",
                developerProfileService.addEndorsement(userId, profileId, request)));
    }

    @Operation(summary = "List all public developer profiles", security = {})
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Developers retrieved successfully")
    })
    @GetMapping("/public")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<Page<UserDtos.DeveloperSummaryResponse>>> getPublicDevelopers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, Math.min(size, 50));
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Developers retrieved", developerProfileService.getPublicDevelopers(pageable)));
    }

    @Operation(summary = "Filter developers (Hiring Assist required)", description = "Requires EMPLOYER role.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Filtered developers retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT"),
        @ApiResponse(responseCode = "402", description = "Payment required (Paywall)"),
        @ApiResponse(responseCode = "403", description = "Insufficient permissions")
    })
    @PostMapping("/filter")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<Page<UserDtos.DeveloperSummaryResponse>>> filterDevelopers(
            Authentication authentication,
            @RequestBody UserDtos.DeveloperFilterRequest request,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        UUID userId = (UUID) authentication.getPrincipal();
        Pageable pageable = PageRequest.of(page, Math.min(size, 50));
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Filtered developers retrieved",
                developerProfileService.filterDevelopers(request, pageable)));
    }

    @Operation(summary = "Export developers (CSV/PDF)", description = "Public export of filtered developers")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Export generated successfully"),
        @ApiResponse(responseCode = "400", description = "Unsupported format")
    })
    @PostMapping("/public/export")
    public ResponseEntity<Resource> exportDevelopers(
            @RequestParam String format,
            @RequestBody UserDtos.DeveloperFilterRequest request) {
        
        java.util.List<UserDtos.DeveloperSummaryResponse> results = developerProfileService.filterDevelopers(request, Pageable.unpaged()).getContent();

        if ("csv".equalsIgnoreCase(format)) {
            byte[] csv = csvExportService.generateDeveloperCsv(results);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=developers.csv")
                    .contentType(MediaType.parseMediaType("text/csv"))
                    .body(new ByteArrayResource(csv));
        }

        if ("pdf".equalsIgnoreCase(format)) {
            byte[] pdf = pdfExportService.generateDeveloperPdf(results);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=developers.pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(new ByteArrayResource(pdf));
        }

        return ResponseEntity.badRequest().build();
    }
}
