package org.moseti.kedevsapi.notifications.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.moseti.kedevsapi.auth.service.EmailService;
import org.moseti.kedevsapi.notifications.dto.NotificationDtos.*;
import org.moseti.kedevsapi.notifications.entity.Notification;
import org.moseti.kedevsapi.notifications.entity.NotificationPreference;
import org.moseti.kedevsapi.notifications.exception.NotificationNotFoundException;
import org.moseti.kedevsapi.notifications.repository.NotificationPreferenceRepository;
import org.moseti.kedevsapi.notifications.repository.NotificationRepository;
import org.moseti.kedevsapi.shared.enums.NotificationCategory;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.moseti.kedevsapi.shared.dto.WebSocketEvent;
import org.moseti.kedevsapi.users.repository.BlockedUserRepository;

import java.util.UUID;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;
import java.util.Collections;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationPreferenceRepository preferenceRepository;
    private final BlockedUserRepository blockedUserRepository;

    private final SimpMessagingTemplate messagingTemplate;
    @Lazy
    private final EmailService emailService;

    private static final ObjectMapper objectMapper = new ObjectMapper();

    @Async
    @Transactional
    public void notify(UUID userId, NotificationCategory category, String title, String message, String metadata) {
        if (userId == null) {
            log.info("Skipping notification save for null userId (Admin notification). Message: {}", message);
            return;
        }

        Map<String, Object> metadataMap = null;
        if (metadata != null && !metadata.isBlank()) {
            try {
                metadataMap = objectMapper.readValue(metadata, new TypeReference<Map<String, Object>>() {});
            } catch (Exception e) {
                log.warn("Failed to parse metadata: {}", metadata, e);
            }
        }

        // 1. Save in-app notification
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setCategory(category);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setMetadata(metadataMap);
        notificationRepository.save(notification);

        log.info("In-app notification saved for user: {}", userId);
        
        // Push via WebSocket
        messagingTemplate.convertAndSendToUser(
            userId.toString(), 
            "/queue/notifications", 
            new WebSocketEvent<>("NEW_NOTIFICATION", mapToResponse(notification))
        );

        // 2. Handle email logic would typically be here, but the user request 
        // specified that the CALLER calls emailService directly after notify() in some hooks, 
        // while others say "check user preferences before sending email".
        // Actually, looking at the prompt: 
        // "save Notification to DB (always) -> check user preferences before sending email -> if email preference enabled -> send email"
        // But the 8 hooks in STEP 7 also say "Replace TODO with: ... notify() ... emailService.send...()"
        // This is slightly contradictory. I'll make notify() handle the preference check IF I add logic for it, 
        // but the prompt explicitly tells me to replace TODOs with BOTH calls.
        // Wait, if I put the email logic inside notify(), and the caller also calls emailService, it will send twice.
        // Re-reading STEP 5: "Core internal method used by all other modules: notify(...) -> save to DB (always) -> check user preferences before sending email ... if enabled send email"
        // And STEP 7: "Replace TODO with: ... notificationService.notify(...) ... emailService.send...()"
        // I will follow STEP 5's internal logic for general cases, but STEP 7's explicit instructions for the 8 hooks.
        // Actually, if I make notify() handle the preference check, I don't need the caller to call emailService.
        // However, the prompt is very specific about what to replace the TODOs with.
        // I'll stick to making notify() a DB-only thing for now OR I can add specialized notify methods.
        // Let's look at STEP 5 again. It says "if email preference enabled for this category -> send email".
        // This implies notify() should know which email to send. But notify() only takes title/message.
        // The email templates are specific.
        // I'll implement notify() to only save to DB as per the specific hook instructions which separate the two.
    }

    @Transactional
    public NotificationPreference getOrCreatePreferences(UUID userId) {
        return preferenceRepository.findByUserId(userId)
                .orElseGet(() -> {
                    NotificationPreference prefs = new NotificationPreference();
                    prefs.setUserId(userId);
                    return preferenceRepository.save(prefs);
                });
    }

    public Page<NotificationResponse> getNotifications(UUID userId, Pageable pageable) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(this::mapToResponse);
    }

    public Page<NotificationResponse> getUnreadNotifications(UUID userId, Pageable pageable) {
        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId, pageable)
                .map(this::mapToResponse);
    }

    public UnreadCountResponse getUnreadCount(UUID userId) {
        return new UnreadCountResponse(notificationRepository.countByUserIdAndIsReadFalse(userId));
    }

    @Transactional
    public void markAsRead(UUID userId, UUID notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new NotificationNotFoundException("Notification not found"));

        if (!notification.getUserId().equals(userId)) {
            throw new NotificationNotFoundException("Notification not found");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(UUID userId) {
        notificationRepository.markAllAsRead(userId);
    }

    public NotificationPreferenceResponse getPreferences(UUID userId) {
        return mapToPreferenceResponse(getOrCreatePreferences(userId));
    }

    @Transactional
    public NotificationPreferenceResponse updatePreferences(UUID userId, UpdatePreferencesRequest request) {
        NotificationPreference prefs = getOrCreatePreferences(userId);

        if (request.emailOnPaymentReceipt() != null) prefs.setEmailOnPaymentReceipt(request.emailOnPaymentReceipt());
        if (request.emailOnJobApplication() != null) prefs.setEmailOnJobApplication(request.emailOnJobApplication());
        if (request.emailOnJobFlagged() != null) prefs.setEmailOnJobFlagged(request.emailOnJobFlagged());
        if (request.emailOnSpotlightExpired() != null) prefs.setEmailOnSpotlightExpired(request.emailOnSpotlightExpired());
        if (request.emailOnSpotlightOverridden() != null) prefs.setEmailOnSpotlightOverridden(request.emailOnSpotlightOverridden());
        if (request.emailOnVerifiedBadge() != null) prefs.setEmailOnVerifiedBadge(request.emailOnVerifiedBadge());

        if (request.inAppOnJobApplication() != null) prefs.setInAppOnJobApplication(request.inAppOnJobApplication());
        if (request.inAppOnCommentReply() != null) prefs.setInAppOnCommentReply(request.inAppOnCommentReply());
        if (request.inAppOnEndorsement() != null) prefs.setInAppOnEndorsement(request.inAppOnEndorsement());
        if (request.inAppOnFlagReviewed() != null) prefs.setInAppOnFlagReviewed(request.inAppOnFlagReviewed());
        if (request.inAppOnSpotlightExpired() != null) prefs.setInAppOnSpotlightExpired(request.inAppOnSpotlightExpired());

        return mapToPreferenceResponse(preferenceRepository.save(prefs));
    }

    @Transactional
    public void deleteNotification(UUID userId, UUID notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new NotificationNotFoundException("Notification not found"));

        if (!notification.getUserId().equals(userId)) {
            throw new NotificationNotFoundException("Notification not found");
        }

        notificationRepository.delete(notification);
    }

    private NotificationResponse mapToResponse(Notification n) {
        Map<String, Object> metadata = n.getMetadata();
        if (metadata != null && metadata.containsKey("senderUserId")) {
            try {
                UUID senderId = UUID.fromString(metadata.get("senderUserId").toString());
                boolean isBlocked = blockedUserRepository.existsByBlockerIdAndBlockedId(n.getUserId(), senderId);
                metadata.put("isSenderBlocked", isBlocked);
            } catch (Exception e) {
                // Ignore parsing errors
            }
        }
        return new NotificationResponse(
                n.getId(),
                n.getUserId(),
                n.getCategory(),
                n.getTitle(),
                n.getMessage(),
                n.isRead(),
                metadata,
                n.getCreatedAt()
        );
    }

    private NotificationPreferenceResponse mapToPreferenceResponse(NotificationPreference p) {
        return new NotificationPreferenceResponse(
                p.isEmailOnPaymentReceipt(),
                p.isEmailOnJobApplication(),
                p.isEmailOnJobFlagged(),
                p.isEmailOnSpotlightExpired(),
                p.isEmailOnSpotlightOverridden(),
                p.isEmailOnVerifiedBadge(),
                p.isInAppOnJobApplication(),
                p.isInAppOnCommentReply(),
                p.isInAppOnEndorsement(),
                p.isInAppOnFlagReviewed(),
                p.isInAppOnSpotlightExpired()
        );
    }
}
