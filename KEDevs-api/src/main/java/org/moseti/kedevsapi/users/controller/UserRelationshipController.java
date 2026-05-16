package org.moseti.kedevsapi.users.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.moseti.kedevsapi.shared.dto.ApiResponse;
import org.moseti.kedevsapi.users.service.EmployerProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "User Relationships")
public class UserRelationshipController {

    private final EmployerProfileService employerProfileService;

    @Operation(summary = "Block a user")
    @PostMapping("/{userId}/block")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> blockUser(
            Authentication authentication,
            @PathVariable UUID userId) {
        UUID blockerId = (UUID) authentication.getPrincipal();
        employerProfileService.blockUser(blockerId, userId);
        return ResponseEntity.ok(ApiResponse.success("User blocked successfully"));
    }

    @Operation(summary = "Unblock a user")
    @DeleteMapping("/{userId}/block")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> unblockUser(
            Authentication authentication,
            @PathVariable UUID userId) {
        UUID blockerId = (UUID) authentication.getPrincipal();
        employerProfileService.unblockUser(blockerId, userId);
        return ResponseEntity.ok(ApiResponse.success("User unblocked successfully"));
    }
}
