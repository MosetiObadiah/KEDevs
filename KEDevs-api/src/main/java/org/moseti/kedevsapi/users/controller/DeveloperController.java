package org.moseti.kedevsapi.users.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.moseti.kedevsapi.shared.dto.ApiResponse;
import org.moseti.kedevsapi.shared.enums.AvailabilityStatus;
import org.moseti.kedevsapi.shared.enums.ProfileVisibility;
import org.moseti.kedevsapi.users.dto.UserDtos;
import org.moseti.kedevsapi.users.service.DeveloperProfileService;
import org.moseti.kedevsapi.users.service.EmployerProfileService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/developers")
@RequiredArgsConstructor
public class DeveloperController {

    private final DeveloperProfileService developerProfileService;
    private final EmployerProfileService employerProfileService;

    // POST /api/v1/developers/profile
    @PostMapping("/profile")
    @PreAuthorize("hasRole('DEVELOPER')")
    public ResponseEntity<ApiResponse<UserDtos.DeveloperProfileResponse>> createProfile(
            Authentication authentication,
            @Valid @RequestBody UserDtos.CreateDeveloperProfileRequest request) {
        UUID userId = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(ApiResponse.success("Profile created", developerProfileService.createProfile(userId, request)));
    }

    // GET /api/v1/developers/profile/me
    @GetMapping("/profile/me")
    @PreAuthorize("hasRole('DEVELOPER')")
    public ResponseEntity<ApiResponse<UserDtos.DeveloperProfileResponse>> getMyProfile(Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(ApiResponse.success("Profile retrieved", developerProfileService.getProfileByUserId(userId)));
    }

    // GET /api/v1/developers/{profileId}
    @GetMapping("/{profileId}")
    public ResponseEntity<ApiResponse<UserDtos.DeveloperProfileResponse>> getPublicProfile(@PathVariable UUID profileId) {
        return ResponseEntity.ok(ApiResponse.success("Profile retrieved", developerProfileService.getPublicProfile(profileId)));
    }

    // PUT /api/v1/developers/profile
    @PutMapping("/profile")
    @PreAuthorize("hasRole('DEVELOPER')")
    public ResponseEntity<ApiResponse<UserDtos.DeveloperProfileResponse>> updateProfile(
            Authentication authentication,
            @Valid @RequestBody UserDtos.UpdateDeveloperProfileRequest request) {
        UUID userId = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(ApiResponse.success("Profile updated", developerProfileService.updateProfile(userId, request)));
    }

    // PATCH /api/v1/developers/profile/availability
    @PatchMapping("/profile/availability")
    @PreAuthorize("hasRole('DEVELOPER')")
    public ResponseEntity<ApiResponse<Void>> toggleAvailability(
            Authentication authentication,
            @RequestParam AvailabilityStatus status) {
        UUID userId = (UUID) authentication.getPrincipal();
        developerProfileService.toggleAvailability(userId, status);
        return ResponseEntity.ok(ApiResponse.success("Availability updated"));
    }

    // PATCH /api/v1/developers/profile/visibility
    @PatchMapping("/profile/visibility")
    @PreAuthorize("hasRole('DEVELOPER')")
    public ResponseEntity<ApiResponse<Void>> updateVisibility(
            Authentication authentication,
            @RequestParam ProfileVisibility visibility) {
        UUID userId = (UUID) authentication.getPrincipal();
        developerProfileService.updateVisibility(userId, visibility);
        return ResponseEntity.ok(ApiResponse.success("Visibility updated"));
    }

    // POST /api/v1/developers/profile/skills
    @PostMapping("/profile/skills")
    @PreAuthorize("hasRole('DEVELOPER')")
    public ResponseEntity<ApiResponse<Void>> addSkill(
            Authentication authentication,
            @Valid @RequestBody UserDtos.AddSkillRequest request) {
        UUID userId = (UUID) authentication.getPrincipal();
        developerProfileService.addSkill(userId, request.skill());
        return ResponseEntity.ok(ApiResponse.success("Skill added"));
    }

    // DELETE /api/v1/developers/profile/skills/{skill}
    @DeleteMapping("/profile/skills/{skill}")
    @PreAuthorize("hasRole('DEVELOPER')")
    public ResponseEntity<ApiResponse<Void>> removeSkill(
            Authentication authentication,
            @PathVariable String skill) {
        UUID userId = (UUID) authentication.getPrincipal();
        developerProfileService.removeSkill(userId, skill);
        return ResponseEntity.ok(ApiResponse.success("Skill removed"));
    }

    // POST /api/v1/developers/profile/languages
    @PostMapping("/profile/languages")
    @PreAuthorize("hasRole('DEVELOPER')")
    public ResponseEntity<ApiResponse<Void>> addLanguage(
            Authentication authentication,
            @Valid @RequestBody UserDtos.AddLanguageRequest request) {
        UUID userId = (UUID) authentication.getPrincipal();
        developerProfileService.addLanguage(userId, request.language());
        return ResponseEntity.ok(ApiResponse.success("Language added"));
    }

    // DELETE /api/v1/developers/profile/languages/{language}
    @DeleteMapping("/profile/languages/{language}")
    @PreAuthorize("hasRole('DEVELOPER')")
    public ResponseEntity<ApiResponse<Void>> removeLanguage(
            Authentication authentication,
            @PathVariable String language) {
        UUID userId = (UUID) authentication.getPrincipal();
        developerProfileService.removeLanguage(userId, language);
        return ResponseEntity.ok(ApiResponse.success("Language removed"));
    }

    // POST /api/v1/developers/profile/education
    @PostMapping("/profile/education")
    @PreAuthorize("hasRole('DEVELOPER')")
    public ResponseEntity<ApiResponse<UserDtos.EducationResponse>> addEducation(
            Authentication authentication,
            @Valid @RequestBody UserDtos.AddEducationRequest request) {
        UUID userId = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(ApiResponse.success("Education added", developerProfileService.addEducation(userId, request)));
    }

    // DELETE /api/v1/developers/profile/education/{id}
    @DeleteMapping("/profile/education/{id}")
    @PreAuthorize("hasRole('DEVELOPER')")
    public ResponseEntity<ApiResponse<Void>> deleteEducation(
            Authentication authentication,
            @PathVariable UUID id) {
        UUID userId = (UUID) authentication.getPrincipal();
        developerProfileService.deleteEducation(userId, id);
        return ResponseEntity.ok(ApiResponse.success("Education deleted"));
    }

    // POST /api/v1/developers/profile/certifications
    @PostMapping("/profile/certifications")
    @PreAuthorize("hasRole('DEVELOPER')")
    public ResponseEntity<ApiResponse<UserDtos.CertificationResponse>> addCertification(
            Authentication authentication,
            @Valid @RequestBody UserDtos.AddCertificationRequest request) {
        UUID userId = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(ApiResponse.success("Certification added", developerProfileService.addCertification(userId, request)));
    }

    // DELETE /api/v1/developers/profile/certifications/{id}
    @DeleteMapping("/profile/certifications/{id}")
    @PreAuthorize("hasRole('DEVELOPER')")
    public ResponseEntity<ApiResponse<Void>> deleteCertification(
            Authentication authentication,
            @PathVariable UUID id) {
        UUID userId = (UUID) authentication.getPrincipal();
        developerProfileService.deleteCertification(userId, id);
        return ResponseEntity.ok(ApiResponse.success("Certification deleted"));
    }

    // POST /api/v1/developers/profile/oss
    @PostMapping("/profile/oss")
    @PreAuthorize("hasRole('DEVELOPER')")
    public ResponseEntity<ApiResponse<UserDtos.OssContributionResponse>> addOssContribution(
            Authentication authentication,
            @Valid @RequestBody UserDtos.AddOssContributionRequest request) {
        UUID userId = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(ApiResponse.success("OSS contribution added", developerProfileService.addOssContribution(userId, request)));
    }

    // DELETE /api/v1/developers/profile/oss/{id}
    @DeleteMapping("/profile/oss/{id}")
    @PreAuthorize("hasRole('DEVELOPER')")
    public ResponseEntity<ApiResponse<Void>> deleteOssContribution(
            Authentication authentication,
            @PathVariable UUID id) {
        UUID userId = (UUID) authentication.getPrincipal();
        developerProfileService.deleteOssContribution(userId, id);
        return ResponseEntity.ok(ApiResponse.success("OSS contribution deleted"));
    }

    // POST /api/v1/developers/profile/achievements
    @PostMapping("/profile/achievements")
    @PreAuthorize("hasRole('DEVELOPER')")
    public ResponseEntity<ApiResponse<UserDtos.AchievementResponse>> addAchievement(
            Authentication authentication,
            @Valid @RequestBody UserDtos.AddAchievementRequest request) {
        UUID userId = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(ApiResponse.success("Achievement added", developerProfileService.addAchievement(userId, request)));
    }

    // DELETE /api/v1/developers/profile/achievements/{id}
    @DeleteMapping("/profile/achievements/{id}")
    @PreAuthorize("hasRole('DEVELOPER')")
    public ResponseEntity<ApiResponse<Void>> deleteAchievement(
            Authentication authentication,
            @PathVariable UUID id) {
        UUID userId = (UUID) authentication.getPrincipal();
        developerProfileService.deleteAchievement(userId, id);
        return ResponseEntity.ok(ApiResponse.success("Achievement deleted"));
    }

    // POST /api/v1/developers/profile/projects
    @PostMapping("/profile/projects")
    @PreAuthorize("hasRole('DEVELOPER')")
    public ResponseEntity<ApiResponse<UserDtos.DeveloperProjectResponse>> addProject(
            Authentication authentication,
            @Valid @RequestBody UserDtos.AddProjectRequest request) {
        UUID userId = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(ApiResponse.success("Project added", developerProfileService.addProject(userId, request)));
    }

    // PUT /api/v1/developers/profile/projects/{id}
    @PutMapping("/profile/projects/{id}")
    @PreAuthorize("hasRole('DEVELOPER')")
    public ResponseEntity<ApiResponse<UserDtos.DeveloperProjectResponse>> updateProject(
            Authentication authentication,
            @PathVariable UUID id,
            @Valid @RequestBody UserDtos.AddProjectRequest request) {
        UUID userId = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(ApiResponse.success("Project updated", developerProfileService.updateProject(userId, id, request)));
    }

    // DELETE /api/v1/developers/profile/projects/{id}
    @DeleteMapping("/profile/projects/{id}")
    @PreAuthorize("hasRole('DEVELOPER')")
    public ResponseEntity<ApiResponse<Void>> deleteProject(
            Authentication authentication,
            @PathVariable UUID id) {
        UUID userId = (UUID) authentication.getPrincipal();
        developerProfileService.deleteProject(userId, id);
        return ResponseEntity.ok(ApiResponse.success("Project deleted"));
    }

    // PATCH /api/v1/developers/profile/projects/{id}/featured
    @PatchMapping("/profile/projects/{id}/featured")
    @PreAuthorize("hasRole('DEVELOPER')")
    public ResponseEntity<ApiResponse<Void>> toggleFeatured(
            Authentication authentication,
            @PathVariable UUID id) {
        UUID userId = (UUID) authentication.getPrincipal();
        developerProfileService.toggleFeatured(userId, id);
        return ResponseEntity.ok(ApiResponse.success("Featured status toggled"));
    }

    // POST /api/v1/developers/{profileId}/endorsements
    @PostMapping("/{profileId}/endorsements")
    public ResponseEntity<ApiResponse<UserDtos.EndorsementResponse>> addEndorsement(
            Authentication authentication,
            @PathVariable UUID profileId,
            @Valid @RequestBody UserDtos.CreateEndorsementRequest request) {
        UUID userId = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(ApiResponse.success("Endorsement added",
                developerProfileService.addEndorsement(userId, profileId, request)));
    }

    // GET /api/v1/developers/public (public - no auth required)
    @GetMapping("/public")
    public ResponseEntity<ApiResponse<Page<UserDtos.DeveloperSummaryResponse>>> getPublicDevelopers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, Math.min(size, 50));
        return ResponseEntity.ok(ApiResponse.success("Developers retrieved", developerProfileService.getPublicDevelopers(pageable)));
    }

    // POST /api/v1/developers/filter (EMPLOYER PRO only)
    @PostMapping("/filter")
    @PreAuthorize("hasRole('EMPLOYER') and @employerProfileService.isProAccount(authentication.principal)")
    public ResponseEntity<ApiResponse<Page<UserDtos.DeveloperSummaryResponse>>> filterDevelopers(
            Authentication authentication,
            @RequestBody UserDtos.DeveloperFilterRequest request,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, Math.min(size, 50));
        return ResponseEntity.ok(ApiResponse.success("Filtered developers retrieved",
                developerProfileService.filterDevelopers(request, pageable)));
    }
}
