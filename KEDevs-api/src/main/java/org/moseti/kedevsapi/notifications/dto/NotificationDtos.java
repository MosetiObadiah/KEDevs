package org.moseti.kedevsapi.notifications.dto;

import org.moseti.kedevsapi.shared.enums.NotificationCategory;

import java.time.LocalDateTime;
import java.util.UUID;

public class NotificationDtos {

    public record UpdatePreferencesRequest(
            Boolean emailOnPaymentReceipt,
            Boolean emailOnJobApplication,
            Boolean emailOnJobFlagged,
            Boolean emailOnSubscriptionExpiry,
            Boolean emailOnSpotlightExpired,
            Boolean emailOnSpotlightOverridden,
            Boolean emailOnVerifiedBadge,
            Boolean emailOnProUpgrade,
            Boolean inAppOnJobApplication,
            Boolean inAppOnCommentReply,
            Boolean inAppOnEndorsement,
            Boolean inAppOnFlagReviewed,
            Boolean inAppOnSpotlightExpired
    ) {}

    public record NotificationResponse(
            UUID id,
            UUID userId,
            NotificationCategory category,
            String title,
            String message,
            boolean isRead,
            String metadata,
            LocalDateTime createdAt
    ) {}

    public record NotificationPreferenceResponse(
            boolean emailOnPaymentReceipt,
            boolean emailOnJobApplication,
            boolean emailOnJobFlagged,
            boolean emailOnSubscriptionExpiry,
            boolean emailOnSpotlightExpired,
            boolean emailOnSpotlightOverridden,
            boolean emailOnVerifiedBadge,
            boolean emailOnProUpgrade,
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
