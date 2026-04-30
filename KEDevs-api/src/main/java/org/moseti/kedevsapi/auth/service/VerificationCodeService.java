package org.moseti.kedevsapi.auth.service;

import lombok.RequiredArgsConstructor;
import org.moseti.kedevsapi.auth.entity.VerificationCode;
import org.moseti.kedevsapi.auth.repository.VerificationCodeRepository;
import org.moseti.kedevsapi.shared.util.Constants;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class VerificationCodeService {

    private final VerificationCodeRepository verificationCodeRepository;
    private static final SecureRandom RANDOM = new SecureRandom();

    @Transactional
    public String generateCode(UUID userId, VerificationCode.CodeType type) {
        // Delete any existing codes for this user and type
        verificationCodeRepository.deleteByUserId(userId);

        String code = generateRandomCode();

        VerificationCode verificationCode = new VerificationCode();
        verificationCode.setUserId(userId);
        verificationCode.setCode(code);
        verificationCode.setType(type);
        verificationCode.setExpiresAt(LocalDateTime.now().plusMinutes(Constants.VERIFICATION_CODE_EXPIRY_MINUTES));

        verificationCodeRepository.save(verificationCode);
        return code;
    }

    public boolean verifyCode(UUID userId, String code, VerificationCode.CodeType type) {
        var verificationCode = verificationCodeRepository
                .findByUserIdAndCodeAndTypeAndUsedFalseAndExpiresAtAfter(
                        userId, code, type, LocalDateTime.now()
                );

        if (verificationCode.isPresent()) {
            VerificationCode vc = verificationCode.get();
            vc.setUsed(true);
            verificationCodeRepository.save(vc);
            return true;
        }
        return false;
    }

    private String generateRandomCode() {
        StringBuilder code = new StringBuilder();
        for (int i = 0; i < Constants.VERIFICATION_CODE_LENGTH; i++) {
            code.append(RANDOM.nextInt(10));
        }
        return code.toString();
    }
}

