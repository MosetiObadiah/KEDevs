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
@Table(name = "company_inquiries")
public class CompanyInquiry extends BaseEntity {

    @Column(name = "sender_user_id", nullable = false)
    private UUID senderUserId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_user_id", insertable = false, updatable = false)
    private User senderUser;

    @Column(name = "employer_profile_id", nullable = false)
    private UUID employerProfileId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employer_profile_id", insertable = false, updatable = false)
    private EmployerProfile employerProfile;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ContactRequestStatus status = ContactRequestStatus.PENDING;
}
