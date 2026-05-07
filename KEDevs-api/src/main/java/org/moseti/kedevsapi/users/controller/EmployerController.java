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
            @org.springframework.data.web.PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Employer profiles fetched", employerProfileService.getPublicProfiles(pageable)));
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

    @Operation(summary = "Save a filter search (Pro)", description = "Requires EMPLOYER PRO status.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Search saved successfully"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT"),
        @ApiResponse(responseCode = "403", description = "Requires Pro account")
    })
    @PostMapping("/searches")
    @PreAuthorize("hasRole('EMPLOYER') and @employerProfileService.isProAccount(authentication.principal)")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<UserDtos.SavedSearchResponse>> saveSearch(
            Authentication authentication,
            @Valid @RequestBody UserDtos.SaveSearchRequest request) {
        UUID userId = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Search saved",
                employerProfileService.saveSearch(userId, request)));
    }

    @Operation(summary = "List saved filter searches (Pro)", description = "Requires EMPLOYER PRO status.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Searches retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT"),
        @ApiResponse(responseCode = "403", description = "Requires Pro account")
    })
    @GetMapping("/searches")
    @PreAuthorize("hasRole('EMPLOYER') and @employerProfileService.isProAccount(authentication.principal)")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<List<UserDtos.SavedSearchResponse>>> getSavedSearches(
            Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Searches retrieved",
                employerProfileService.getSavedSearches(userId)));
    }

    @Operation(summary = "Delete a saved search (Pro)", description = "Requires EMPLOYER PRO status.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Search deleted successfully"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT"),
        @ApiResponse(responseCode = "403", description = "Requires Pro account"),
        @ApiResponse(responseCode = "404", description = "Search not found")
    })
    @DeleteMapping("/searches/{id}")
    @PreAuthorize("hasRole('EMPLOYER') and @employerProfileService.isProAccount(authentication.principal)")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<Void>> deleteSavedSearch(
            Authentication authentication,
            @Parameter(description = "ID of the saved search") @PathVariable UUID id) {
        UUID userId = (UUID) authentication.getPrincipal();
        employerProfileService.deleteSavedSearch(userId, id);
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Search deleted"));
    }

    @Operation(summary = "Bookmark a developer (Pro)", description = "Requires EMPLOYER PRO status.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Developer bookmarked successfully"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT"),
        @ApiResponse(responseCode = "403", description = "Requires Pro account")
    })
    @PostMapping("/bookmarks/{developerId}")
    @PreAuthorize("hasRole('EMPLOYER') and @employerProfileService.isProAccount(authentication.principal)")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<UserDtos.BookmarkResponse>> bookmarkDeveloper(
            Authentication authentication,
            @Parameter(description = "ID of the developer profile to bookmark") @PathVariable UUID developerId) {
        UUID userId = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Developer bookmarked",
                employerProfileService.bookmarkDeveloper(userId, developerId)));
    }

    @Operation(summary = "Remove a bookmark (Pro)", description = "Requires EMPLOYER PRO status.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Bookmark removed successfully"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT"),
        @ApiResponse(responseCode = "403", description = "Requires Pro account"),
        @ApiResponse(responseCode = "404", description = "Bookmark not found")
    })
    @DeleteMapping("/bookmarks/{developerId}")
    @PreAuthorize("hasRole('EMPLOYER') and @employerProfileService.isProAccount(authentication.principal)")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<Void>> removeBookmark(
            Authentication authentication,
            @Parameter(description = "ID of the developer profile to un-bookmark") @PathVariable UUID developerId) {
        UUID userId = (UUID) authentication.getPrincipal();
        employerProfileService.removeBookmark(userId, developerId);
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Bookmark removed"));
    }

    @Operation(summary = "List bookmarked developers (Pro)", description = "Requires EMPLOYER PRO status.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Bookmarks retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT"),
        @ApiResponse(responseCode = "403", description = "Requires Pro account")
    })
    @GetMapping("/bookmarks")
    @PreAuthorize("hasRole('EMPLOYER') and @employerProfileService.isProAccount(authentication.principal)")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<Page<UserDtos.BookmarkResponse>>> getBookmarks(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        UUID userId = (UUID) authentication.getPrincipal();
        Pageable pageable = PageRequest.of(page, Math.min(size, 50));
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Bookmarks retrieved",
                employerProfileService.getBookmarks(userId, pageable)));
    }

    @Operation(summary = "Send contact request to developer (Pro)", description = "Requires EMPLOYER PRO status.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Contact request sent successfully"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT"),
        @ApiResponse(responseCode = "403", description = "Requires Pro account"),
        @ApiResponse(responseCode = "429", description = "Daily contact limit exceeded")
    })
    @PostMapping("/contact/{developerId}")
    @PreAuthorize("hasRole('EMPLOYER') and @employerProfileService.isProAccount(authentication.principal)")
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
}
