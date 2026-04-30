package org.moseti.kedevsapi.auth.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.moseti.kedevsapi.auth.entity.VerificationCode;
import org.moseti.kedevsapi.auth.repository.VerificationCodeRepository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VerificationCodeServiceTest {

    @Mock
    private VerificationCodeRepository verificationCodeRepository;

    @InjectMocks
    private VerificationCodeService verificationCodeService;

    private UUID testUserId;

    @BeforeEach
    void setUp() {
        testUserId = UUID.randomUUID();
    }

    @Test
    void generateCode_Success() {
        // Given
        when(verificationCodeRepository.save(any(VerificationCode.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        // When
        String code = verificationCodeService.generateCode(testUserId, VerificationCode.CodeType.EMAIL_VERIFICATION);

        // Then
        assertNotNull(code);
        assertEquals(6, code.length());
        assertTrue(code.matches("\\d{6}")); // 6 digits
        verify(verificationCodeRepository).deleteByUserId(testUserId);
        verify(verificationCodeRepository).save(any(VerificationCode.class));
    }

    @Test
    void generateCode_DeletesOldCodes() {
        // Given
        when(verificationCodeRepository.save(any(VerificationCode.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        // When
        verificationCodeService.generateCode(testUserId, VerificationCode.CodeType.EMAIL_VERIFICATION);

        // Then
        verify(verificationCodeRepository).deleteByUserId(testUserId);
    }

    @Test
    void verifyCode_ValidCode_ReturnsTrue() {
        // Given
        String code = "123456";
        VerificationCode verificationCode = new VerificationCode();
        verificationCode.setUserId(testUserId);
        verificationCode.setCode(code);
        verificationCode.setType(VerificationCode.CodeType.EMAIL_VERIFICATION);
        verificationCode.setExpiresAt(LocalDateTime.now().plusMinutes(15));
        verificationCode.setUsed(false);

        when(verificationCodeRepository.findByUserIdAndCodeAndTypeAndUsedFalseAndExpiresAtAfter(
                eq(testUserId), eq(code), eq(VerificationCode.CodeType.EMAIL_VERIFICATION), any(LocalDateTime.class)))
                .thenReturn(Optional.of(verificationCode));

        // When
        boolean result = verificationCodeService.verifyCode(testUserId, code, VerificationCode.CodeType.EMAIL_VERIFICATION);

        // Then
        assertTrue(result);
        assertTrue(verificationCode.isUsed());
        verify(verificationCodeRepository).save(verificationCode);
    }

    @Test
    void verifyCode_InvalidCode_ReturnsFalse() {
        // Given
        String code = "000000";

        when(verificationCodeRepository.findByUserIdAndCodeAndTypeAndUsedFalseAndExpiresAtAfter(
                eq(testUserId), eq(code), eq(VerificationCode.CodeType.EMAIL_VERIFICATION), any(LocalDateTime.class)))
                .thenReturn(Optional.empty());

        // When
        boolean result = verificationCodeService.verifyCode(testUserId, code, VerificationCode.CodeType.EMAIL_VERIFICATION);

        // Then
        assertFalse(result);
        verify(verificationCodeRepository, never()).save(any());
    }

    @Test
    void verifyCode_MarkCodeAsUsed() {
        // Given
        String code = "123456";
        VerificationCode verificationCode = new VerificationCode();
        verificationCode.setUsed(false);

        when(verificationCodeRepository.findByUserIdAndCodeAndTypeAndUsedFalseAndExpiresAtAfter(
                any(), any(), any(), any()))
                .thenReturn(Optional.of(verificationCode));

        // When
        verificationCodeService.verifyCode(testUserId, code, VerificationCode.CodeType.EMAIL_VERIFICATION);

        // Then
        assertTrue(verificationCode.isUsed());
    }

    @Test
    void generateCode_DifferentTypes() {
        // Given
        when(verificationCodeRepository.save(any(VerificationCode.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        // When
        String emailCode = verificationCodeService.generateCode(testUserId, VerificationCode.CodeType.EMAIL_VERIFICATION);
        String resetCode = verificationCodeService.generateCode(testUserId, VerificationCode.CodeType.PASSWORD_RESET);

        // Then
        assertNotNull(emailCode);
        assertNotNull(resetCode);
        assertEquals(6, emailCode.length());
        assertEquals(6, resetCode.length());
    }
}

