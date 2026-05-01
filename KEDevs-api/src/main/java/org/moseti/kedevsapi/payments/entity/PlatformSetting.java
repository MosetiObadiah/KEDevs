package org.moseti.kedevsapi.payments.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.moseti.kedevsapi.shared.entity.BaseEntity;

import java.util.UUID;

@Entity
@Table(name = "platform_settings")
@Getter
@Setter
public class PlatformSetting extends BaseEntity {

    @Column(name = "setting_key", nullable = false, unique = true)
    private String settingKey;

    @Column(name = "setting_value", nullable = false)
    private String settingValue;

    @Column
    private String description;

    @Column(name = "updated_by_admin_id")
    private UUID updatedByAdminId;
}
