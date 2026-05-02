package org.moseti.kedevsapi.notifications.controller;

import lombok.RequiredArgsConstructor;
import org.moseti.kedevsapi.notifications.dto.NotificationDtos.*;
import org.moseti.kedevsapi.notifications.service.NotificationService;
import org.moseti.kedevsapi.shared.dto.ApiResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<NotificationResponse>>> getNotifications(
            @AuthenticationPrincipal UUID userId,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success("Notifications fetched", 
                notificationService.getNotifications(userId, pageable)));
    }

    @GetMapping("/unread")
    public ResponseEntity<ApiResponse<Page<NotificationResponse>>> getUnreadNotifications(
            @AuthenticationPrincipal UUID userId,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success("Unread notifications fetched", 
                notificationService.getUnreadNotifications(userId, pageable)));
    }

    @GetMapping("/unread/count")
    public ResponseEntity<ApiResponse<UnreadCountResponse>> getUnreadCount(
            @AuthenticationPrincipal UUID userId) {
        return ResponseEntity.ok(ApiResponse.success("Unread count fetched", 
                notificationService.getUnreadCount(userId)));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @AuthenticationPrincipal UUID userId,
            @PathVariable UUID id) {
        notificationService.markAsRead(userId, id);
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read"));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(
            @AuthenticationPrincipal UUID userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read"));
    }

    @GetMapping("/preferences")
    public ResponseEntity<ApiResponse<NotificationPreferenceResponse>> getPreferences(
            @AuthenticationPrincipal UUID userId) {
        return ResponseEntity.ok(ApiResponse.success("Preferences fetched", 
                notificationService.getPreferences(userId)));
    }

    @PutMapping("/preferences")
    public ResponseEntity<ApiResponse<NotificationPreferenceResponse>> updatePreferences(
            @AuthenticationPrincipal UUID userId,
            @RequestBody UpdatePreferencesRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Preferences updated", 
                notificationService.updatePreferences(userId, request)));
    }
}
