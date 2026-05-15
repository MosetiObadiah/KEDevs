package org.moseti.kedevsapi.users.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.moseti.kedevsapi.shared.entity.BaseEntity;
import org.moseti.kedevsapi.shared.enums.ContactRequestStatus;

import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "contact_requests")
public class ContactRequest extends BaseEntity {

    @Column(name = "sender_user_id", nullable = false)
    private UUID senderUserId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_user_id", insertable = false, updatable = false)
    private User senderUser;

    @Column(name = "developer_id", nullable = false)
    private UUID developerId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "developer_id", insertable = false, updatable = false)
    private DeveloperProfile developerProfile;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ContactRequestStatus status = ContactRequestStatus.PENDING;
}
