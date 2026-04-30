package org.moseti.kedevsapi.auth.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.moseti.kedevsapi.shared.entity.BaseEntity;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "verification_codes")
public class VerificationCode extends BaseEntity {

    @Column(nullable = false)
    private UUID userId;

    @Column(nullable = false, length = 6)
    private String code;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private CodeType type;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    @Column(nullable = false)
    private boolean used = false;

    public enum CodeType {
        EMAIL_VERIFICATION,
        PASSWORD_RESET
    }
}

