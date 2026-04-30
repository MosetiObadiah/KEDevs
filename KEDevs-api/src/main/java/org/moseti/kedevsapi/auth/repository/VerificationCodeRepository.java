package org.moseti.kedevsapi.auth.repository;

import org.moseti.kedevsapi.auth.entity.VerificationCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VerificationCodeRepository extends JpaRepository<VerificationCode, UUID> {
    
    Optional<VerificationCode> findByUserIdAndCodeAndTypeAndUsedFalseAndExpiresAtAfter(
            UUID userId, 
            String code, 
            VerificationCode.CodeType type,
            LocalDateTime now
    );
    
    void deleteByUserId(UUID userId);
}

