package org.moseti.kedevsapi.admin.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import org.moseti.kedevsapi.shared.entity.BaseEntity;

import java.util.UUID;

@Entity
@Table(name = "admin_actions")
@Getter
@Setter
public class AdminAction extends BaseEntity {

    @Column(nullable = false)
    private UUID adminId;

    @Column(nullable = false)
    private String actionType;

    @Column(nullable = false)
    private String targetType;

    @Column(nullable = false)
    private UUID targetId;

    @Column(columnDefinition = "TEXT")
    private String notes;

    private String outcome;
}
