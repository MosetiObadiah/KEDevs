package org.moseti.kedevsapi.users.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.moseti.kedevsapi.shared.entity.BaseEntity;

import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "developer_certifications")
public class DeveloperCertification extends BaseEntity {

    @Column(name = "developer_id", nullable = false)
    private UUID developerId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "developer_id", insertable = false, updatable = false)
    private DeveloperProfile developerProfile;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String issuedBy;

    @Column(nullable = false)
    private int yearIssued;

    private String certUrl;
}
