package org.moseti.kedevsapi.users.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.moseti.kedevsapi.shared.entity.BaseEntity;

import java.util.UUID;

@Getter
@Setter
@Entity
@Table(
    name = "bookmarked_developers",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_bookmarked_employer_developer",
        columnNames = {"employer_id", "developer_id"}
    )
)
public class BookmarkedDeveloper extends BaseEntity {

    @Column(name = "employer_id", nullable = false)
    private UUID employerId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employer_id", insertable = false, updatable = false)
    private EmployerProfile employerProfile;

    @Column(name = "developer_id", nullable = false)
    private UUID developerId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "developer_id", insertable = false, updatable = false)
    private DeveloperProfile developerProfile;
}
