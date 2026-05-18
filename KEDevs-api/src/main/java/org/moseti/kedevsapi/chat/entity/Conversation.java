package org.moseti.kedevsapi.chat.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.moseti.kedevsapi.shared.entity.BaseEntity;
import org.moseti.kedevsapi.users.entity.ContactRequest;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "conversations")
public class Conversation extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contact_request_id", nullable = false, unique = true)
    private ContactRequest contactRequest;

    @Column(name = "last_message_content", columnDefinition = "TEXT")
    private String lastMessageContent;

    @Column(name = "last_message_at")
    private LocalDateTime lastMessageAt;

    @Column(name = "developer_unread_count", nullable = false)
    private int developerUnreadCount = 0;

    @Column(name = "employer_unread_count", nullable = false)
    private int employerUnreadCount = 0;

    @Column(name = "developer_accepted", nullable = false)
    private boolean developerAccepted = false;

    @Column(name = "employer_accepted", nullable = false)
    private boolean employerAccepted = false;
}
