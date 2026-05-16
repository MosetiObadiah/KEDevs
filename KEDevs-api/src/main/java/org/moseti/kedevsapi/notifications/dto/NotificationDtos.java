package org.moseti.kedevsapi.notifications.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import org.moseti.kedevsapi.shared.enums.NotificationCategory;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.Map;

public class NotificationDtos {

    public record UpdatePreferencesRequest(
            @Schema(description = "Receive email when a payment is processed") Boolean emailOnPaymentReceipt,
            @Schema(description = "Receive email when someone applies to your job") Boolean emailOnJobApplication,
            @Schema(description = "Receive email when your job post is flagged") Boolean emailOnJobFlagged,
            @Schema(description = "Receive email when your spotlight slot expires") Boolean emailOnSpotlightExpired,
            @Schema(description = "Receive email when an admin overrides your spotlight") Boolean emailOnSpotlightOverridden,
            @Schema(description = "Receive email when you are granted a verified badge") Boolean emailOnVerifiedBadge,
            @Schema(description = "Receive in-app notification when someone applies to your job") Boolean inAppOnJobApplication,
            @Schema(description = "Receive in-app notification when someone replies to your comment") Boolean inAppOnCommentReply,
            @Schema(description = "Receive in-app notification when someone endorses you") Boolean inAppOnEndorsement,
            @Schema(description = "Receive in-app notification when your flag is reviewed") Boolean inAppOnFlagReviewed,
            @Schema(description = "Receive in-app notification when your spotlight slot expires") Boolean inAppOnSpotlightExpired
    ) {}

    public record NotificationResponse(
            UUID id,
            UUID userId,
            NotificationCategory category,
            String title,
            String message,
            boolean isRead,
            Map<String, Object> metadata,
            LocalDateTime createdAt
    ) {}

    public record NotificationPreferenceResponse(
            boolean emailOnPaymentReceipt,
            boolean emailOnJobApplication,
            boolean emailOnJobFlagged,
            boolean emailOnSpotlightExpired,
            boolean emailOnSpotlightOverridden,
            boolean emailOnVerifiedBadge,
            boolean inAppOnJobApplication,
            boolean inAppOnCommentReply,
            boolean inAppOnEndorsement,
            boolean inAppOnFlagReviewed,
            boolean inAppOnSpotlightExpired
    ) {}

    public record UnreadCountResponse(
            long count
    ) {}
}
