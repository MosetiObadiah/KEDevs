package org.moseti.kedevsapi.users.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.moseti.kedevsapi.shared.dto.ApiResponse;
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
public class EmployerController {

    private final EmployerProfileService employerProfileService;

    // POST /api/v1/employers/profile
    @PostMapping("/profile")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<ApiResponse<UserDtos.EmployerProfileResponse>> createProfile(
            Authentication authentication,
            @Valid @RequestBody UserDtos.CreateEmployerProfileRequest request) {
        UUID userId = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(ApiResponse.success("Employer profile created",
                employerProfileService.createProfile(userId, request)));
    }

    // GET /api/v1/employers/profile/me
    @GetMapping("/profile/me")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<ApiResponse<UserDtos.EmployerProfileResponse>> getMyProfile(Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(ApiResponse.success("Profile retrieved",
                employerProfileService.getProfileByUserId(userId)));
    }

    // PUT /api/v1/employers/profile
    @PutMapping("/profile")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<ApiResponse<UserDtos.EmployerProfileResponse>> updateProfile(
            Authentication authentication,
            @Valid @RequestBody UserDtos.UpdateEmployerProfileRequest request) {
        UUID userId = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(ApiResponse.success("Profile updated",
                employerProfileService.updateProfile(userId, request)));
    }

    // POST /api/v1/employers/searches (EMPLOYER PRO only)
    @PostMapping("/searches")
    @PreAuthorize("hasRole('EMPLOYER') and @employerProfileService.isProAccount(authentication.principal)")
    public ResponseEntity<ApiResponse<UserDtos.SavedSearchResponse>> saveSearch(
            Authentication authentication,
            @Valid @RequestBody UserDtos.SaveSearchRequest request) {
        UUID userId = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(ApiResponse.success("Search saved",
                employerProfileService.saveSearch(userId, request)));
    }

    // GET /api/v1/employers/searches (EMPLOYER PRO only)
    @GetMapping("/searches")
    @PreAuthorize("hasRole('EMPLOYER') and @employerProfileService.isProAccount(authentication.principal)")
    public ResponseEntity<ApiResponse<List<UserDtos.SavedSearchResponse>>> getSavedSearches(
            Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(ApiResponse.success("Searches retrieved",
                employerProfileService.getSavedSearches(userId)));
    }

    // DELETE /api/v1/employers/searches/{id} (EMPLOYER PRO only)
    @DeleteMapping("/searches/{id}")
    @PreAuthorize("hasRole('EMPLOYER') and @employerProfileService.isProAccount(authentication.principal)")
    public ResponseEntity<ApiResponse<Void>> deleteSavedSearch(
            Authentication authentication,
            @PathVariable UUID id) {
        UUID userId = (UUID) authentication.getPrincipal();
        employerProfileService.deleteSavedSearch(userId, id);
        return ResponseEntity.ok(ApiResponse.success("Search deleted"));
    }

    // POST /api/v1/employers/bookmarks/{developerId} (EMPLOYER PRO only)
    @PostMapping("/bookmarks/{developerId}")
    @PreAuthorize("hasRole('EMPLOYER') and @employerProfileService.isProAccount(authentication.principal)")
    public ResponseEntity<ApiResponse<UserDtos.BookmarkResponse>> bookmarkDeveloper(
            Authentication authentication,
            @PathVariable UUID developerId) {
        UUID userId = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(ApiResponse.success("Developer bookmarked",
                employerProfileService.bookmarkDeveloper(userId, developerId)));
    }

    // DELETE /api/v1/employers/bookmarks/{developerId} (EMPLOYER PRO only)
    @DeleteMapping("/bookmarks/{developerId}")
    @PreAuthorize("hasRole('EMPLOYER') and @employerProfileService.isProAccount(authentication.principal)")
    public ResponseEntity<ApiResponse<Void>> removeBookmark(
            Authentication authentication,
            @PathVariable UUID developerId) {
        UUID userId = (UUID) authentication.getPrincipal();
        employerProfileService.removeBookmark(userId, developerId);
        return ResponseEntity.ok(ApiResponse.success("Bookmark removed"));
    }

    // GET /api/v1/employers/bookmarks (EMPLOYER PRO only)
    @GetMapping("/bookmarks")
    @PreAuthorize("hasRole('EMPLOYER') and @employerProfileService.isProAccount(authentication.principal)")
    public ResponseEntity<ApiResponse<Page<UserDtos.BookmarkResponse>>> getBookmarks(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        UUID userId = (UUID) authentication.getPrincipal();
        Pageable pageable = PageRequest.of(page, Math.min(size, 50));
        return ResponseEntity.ok(ApiResponse.success("Bookmarks retrieved",
                employerProfileService.getBookmarks(userId, pageable)));
    }

    // POST /api/v1/employers/contact/{developerId} (EMPLOYER PRO only)
    @PostMapping("/contact/{developerId}")
    @PreAuthorize("hasRole('EMPLOYER') and @employerProfileService.isProAccount(authentication.principal)")
    public ResponseEntity<ApiResponse<UserDtos.ContactRequestResponse>> sendContactRequest(
            Authentication authentication,
            @PathVariable UUID developerId,
            @Valid @RequestBody UserDtos.ContactRequestDto request) {
        UUID userId = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(ApiResponse.success("Contact request sent",
                employerProfileService.sendContactRequest(userId, developerId, request)));
    }

    // GET /api/v1/employers/contact/requests (DEVELOPER only)
    @GetMapping("/contact/requests")
    @PreAuthorize("hasRole('DEVELOPER')")
    public ResponseEntity<ApiResponse<Page<UserDtos.ContactRequestResponse>>> getContactRequests(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        UUID userId = (UUID) authentication.getPrincipal();
        Pageable pageable = PageRequest.of(page, Math.min(size, 50));
        return ResponseEntity.ok(ApiResponse.success("Contact requests retrieved",
                employerProfileService.getContactRequests(userId, pageable)));
    }

    // PATCH /api/v1/employers/contact/requests/{id} (DEVELOPER only)
    @PatchMapping("/contact/requests/{id}")
    @PreAuthorize("hasRole('DEVELOPER')")
    public ResponseEntity<ApiResponse<UserDtos.ContactRequestResponse>> respondToContactRequest(
            Authentication authentication,
            @PathVariable UUID id,
            @RequestParam ContactRequestStatus status) {
        UUID userId = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(ApiResponse.success("Response recorded",
                employerProfileService.respondToContactRequest(userId, id, status)));
    }
}
