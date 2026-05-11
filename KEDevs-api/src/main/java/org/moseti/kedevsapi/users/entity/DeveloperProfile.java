package org.moseti.kedevsapi.users.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.moseti.kedevsapi.shared.entity.BaseEntity;
import org.moseti.kedevsapi.shared.enums.AvailabilityStatus;
import org.moseti.kedevsapi.shared.enums.ProfileVisibility;
import org.moseti.kedevsapi.shared.enums.WorkType;
import org.moseti.kedevsapi.shared.enums.YearsOfExperience;

import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "developer_profiles")
public class DeveloperProfile extends BaseEntity {

    @Column(name = "user_id", nullable = false, unique = true)
    private UUID userId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(name = "profile_photo")
    private String profilePhoto;

    @Column(length = 300)
    private String bio;

    private String currentLastRole;

    @Enumerated(EnumType.STRING)
    private YearsOfExperience yearsOfExperience;

    @Column(nullable = false)
    private int numberOfProjects = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AvailabilityStatus availabilityStatus = AvailabilityStatus.NOT_AVAILABLE;

    @Enumerated(EnumType.STRING)
    private WorkType preferredWorkType;

    private String locationCity;

    private String locationCountry;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProfileVisibility profileVisibility = ProfileVisibility.PUBLIC;

    @Column(nullable = false)
    private boolean isVerified = false;

    @Column(name = "government_id_url")
    private String governmentIdUrl;

    private String linkedinUrl;

    private String githubUrl;

    private String portfolioUrl;

    private String publicEmail;

    private String publicPhone;
    
    @Column(nullable = false)
    private boolean canEmployersReachOut = true;
}
