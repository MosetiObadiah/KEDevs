package org.moseti.kedevsapi.users.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.moseti.kedevsapi.shared.entity.BaseEntity;
import org.moseti.kedevsapi.shared.enums.Role;
import org.moseti.kedevsapi.shared.enums.VerificationStatus;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "verification_requests")
@Getter
@Setter
public class VerificationRequest extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VerificationStatus status = VerificationStatus.PENDING_PAYMENT;

    @Column(name = "payment_id")
    private UUID paymentId;

    @Column(name = "id_document_url")
    private String idDocumentUrl;

    @Column(name = "passport_photo_url")
    private String passportPhotoUrl;

    @ElementCollection
    @CollectionTable(name = "verification_request_certificates", joinColumns = @JoinColumn(name = "request_id"))
    @Column(name = "certificate_url")
    private List<String> certificateUrls = new ArrayList<>();

    @Column(name = "rejection_reason")
    private String rejectionReason;

    @Column(name = "reviewed_by_id")
    private UUID reviewedById;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;
}
