package org.moseti.kedevsapi.notifications.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.moseti.kedevsapi.notifications.dto.NotificationDtos.*;
import org.moseti.kedevsapi.notifications.service.NotificationService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications")
public class NotificationController {

    private final NotificationService notificationService;

    @Operation(summary = "Get all notifications (paginated)")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Notifications fetched successfully"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT")
    })
    @GetMapping
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<Page<NotificationResponse>>> getNotifications(
            @AuthenticationPrincipal UUID userId,
            Pageable pageable) {
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Notifications fetched", 
                notificationService.getNotifications(userId, pageable)));
    }

    @Operation(summary = "Get unread notifications")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Unread notifications fetched successfully"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT")
    })
    @GetMapping("/unread")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<Page<NotificationResponse>>> getUnreadNotifications(
            @AuthenticationPrincipal UUID userId,
            Pageable pageable) {
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Unread notifications fetched", 
                notificationService.getUnreadNotifications(userId, pageable)));
    }

    @Operation(summary = "Get unread notification count")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Unread count fetched successfully"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT")
    })
    @GetMapping("/unread-count")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<UnreadCountResponse>> getUnreadCount(
            @AuthenticationPrincipal UUID userId) {
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Unread count fetched", 
                notificationService.getUnreadCount(userId)));
    }

    @Operation(summary = "Mark a notification as read")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Notification marked as read successfully"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT"),
        @ApiResponse(responseCode = "404", description = "Notification not found")
    })
    @PatchMapping("/{id}/read")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<Void>> markAsRead(
            @AuthenticationPrincipal UUID userId,
            @Parameter(description = "ID of the notification") @PathVariable UUID id) {
        notificationService.markAsRead(userId, id);
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Notification marked as read"));
    }

    @Operation(summary = "Mark all notifications as read")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "All notifications marked as read successfully"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT")
    })
    @PatchMapping("/read-all")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<Void>> markAllAsRead(
            @AuthenticationPrincipal UUID userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("All notifications marked as read"));
    }

    @Operation(summary = "Get notification preferences")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Preferences fetched successfully"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT")
    })
    @GetMapping("/preferences")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<NotificationPreferenceResponse>> getPreferences(
            @AuthenticationPrincipal UUID userId) {
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Preferences fetched", 
                notificationService.getPreferences(userId)));
    }

    @Operation(summary = "Update notification preferences")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Preferences updated successfully"),
        @ApiResponse(responseCode = "400", description = "Validation error"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT")
    })
    @PutMapping("/preferences")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<NotificationPreferenceResponse>> updatePreferences(
            @AuthenticationPrincipal UUID userId,
            @RequestBody UpdatePreferencesRequest request) {
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Preferences updated", 
                notificationService.updatePreferences(userId, request)));
    }
}
