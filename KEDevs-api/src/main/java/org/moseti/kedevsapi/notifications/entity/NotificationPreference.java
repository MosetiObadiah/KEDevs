package org.moseti.kedevsapi.notifications.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import org.moseti.kedevsapi.shared.entity.BaseEntity;

import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "notification_preferences")
public class NotificationPreference extends BaseEntity {

    @Column(name = "user_id", nullable = false, unique = true)
    private UUID userId;

    @Column(name = "email_on_payment_receipt", nullable = false)
    private boolean emailOnPaymentReceipt = true;

    @Column(name = "email_on_job_application", nullable = false)
    private boolean emailOnJobApplication = true;

    @Column(name = "email_on_job_flagged", nullable = false)
    private boolean emailOnJobFlagged = true;

    @Column(name = "email_on_spotlight_expired", nullable = false)
    private boolean emailOnSpotlightExpired = true;

    @Column(name = "email_on_spotlight_overridden", nullable = false)
    private boolean emailOnSpotlightOverridden = true;

    @Column(name = "email_on_verified_badge", nullable = false)
    private boolean emailOnVerifiedBadge = true;

    @Column(name = "in_app_on_job_application", nullable = false)
    private boolean inAppOnJobApplication = true;

    @Column(name = "in_app_on_comment_reply", nullable = false)
    private boolean inAppOnCommentReply = true;

    @Column(name = "in_app_on_endorsement", nullable = false)
    private boolean inAppOnEndorsement = true;

    @Column(name = "in_app_on_flag_reviewed", nullable = false)
    private boolean inAppOnFlagReviewed = true;

    @Column(name = "in_app_on_spotlight_expired", nullable = false)
    private boolean inAppOnSpotlightExpired = true;
}
