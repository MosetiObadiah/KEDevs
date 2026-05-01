package org.moseti.kedevsapi.users.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.moseti.kedevsapi.shared.entity.BaseEntity;

import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "saved_developer_searches")
public class SavedDeveloperSearch extends BaseEntity {

    @Column(name = "employer_id", nullable = false)
    private UUID employerId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employer_id", insertable = false, updatable = false)
    private EmployerProfile employerProfile;

    @Column(nullable = false)
    private String searchName;

    @Column(name = "filter_criteria", columnDefinition = "jsonb", nullable = false)
    private String filterCriteria;
}
