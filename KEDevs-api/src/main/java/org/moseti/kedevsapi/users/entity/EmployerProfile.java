package org.moseti.kedevsapi.users.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.moseti.kedevsapi.shared.entity.BaseEntity;
import org.moseti.kedevsapi.shared.enums.CompanySize;

import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "employer_profiles")
public class EmployerProfile extends BaseEntity {

    @Column(name = "user_id", nullable = false, unique = true)
    private UUID userId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    @Column(nullable = false)
    private String contactPersonName;

    @Column(nullable = false)
    private String companyName;

    private String companyWebsite;

    private String industry;

    @Enumerated(EnumType.STRING)
    private CompanySize companySize;

    @Column(name = "location_hq")
    private String locationHQ;

    @Column(columnDefinition = "TEXT")
    private String companyBio;

    private String logoUrl;

    private String linkedinUrl;

    private String twitterUrl;

    @Column(name = "is_approved", nullable = false)
    private boolean isApproved = false;

    @Column(name = "is_pro_account", nullable = false)
    private boolean isProAccount = false;

    @Column(name = "is_verified", nullable = false)
    private boolean isVerified = false;
}
