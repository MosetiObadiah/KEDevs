package org.moseti.kedevsapi.auth.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.moseti.kedevsapi.auth.dto.LoginRequest;
import org.moseti.kedevsapi.auth.dto.RegisterRequest;
import org.moseti.kedevsapi.auth.dto.AuthResponse;
import org.moseti.kedevsapi.auth.dto.VerifyCodeRequest;
import org.moseti.kedevsapi.auth.dto.PasswordResetRequest;
import org.moseti.kedevsapi.auth.dto.ResetPasswordConfirmRequest;
import org.moseti.kedevsapi.auth.entity.VerificationCode;
import org.moseti.kedevsapi.auth.exception.EmailAlreadyExistsException;
import org.moseti.kedevsapi.auth.exception.InvalidCredentialsException;
import org.moseti.kedevsapi.auth.exception.InvalidVerificationCodeException;
import org.moseti.kedevsapi.auth.exception.AccountNotApprovedException;
import org.moseti.kedevsapi.auth.repository.RefreshTokenRepository;
import org.moseti.kedevsapi.shared.enums.AccountStatus;
import org.moseti.kedevsapi.shared.enums.Role;
import org.moseti.kedevsapi.shared.exception.BadRequestException;
import org.moseti.kedevsapi.shared.exception.ForbiddenException;
import org.moseti.kedevsapi.shared.exception.ResourceNotFoundException;
import org.moseti.kedevsapi.users.entity.User;
import org.moseti.kedevsapi.users.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private VerificationCodeService verificationCodeService;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private AuthService authService;

    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;
    private User testUser;

    @BeforeEach
    void setUp() {
        registerRequest = new RegisterRequest();
        registerRequest.setEmail("test@example.com");
        registerRequest.setPassword("password123");
        registerRequest.setFullName("Test User");
        registerRequest.setRole(Role.DEVELOPER);

        loginRequest = new LoginRequest();
        loginRequest.setEmail("test@example.com");
        loginRequest.setPassword("password123");

        testUser = new User();
        testUser.setId(UUID.randomUUID());
        testUser.setEmail("test@example.com");
        testUser.setPassword("encodedPassword");
        testUser.setFullName("Test User");
        testUser.setRole(Role.DEVELOPER);
        testUser.setEmailVerified(true);
        testUser.setAccountStatus(AccountStatus.ACTIVE);
        testUser.setApprovedByAdmin(true);
        testUser.setGracePeriodEndsAt(LocalDateTime.now().plusDays(3));
        testUser.setSubscriptionActive(false);
    }

    @Test
    void register_Success() {
        // Given
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(verificationCodeService.generateCode(any(UUID.class), any(VerificationCode.CodeType.class)))
                .thenReturn("123456");
        when(jwtService.generateAccessToken(any(UUID.class), anyString(), any(Role.class)))
                .thenReturn("accessToken");
        when(jwtService.generateRefreshToken(any(UUID.class))).thenReturn("refreshToken");

        // When
        AuthResponse response = authService.register(registerRequest);

        // Then
        assertNotNull(response);
        assertEquals("accessToken", response.getAccessToken());
        assertEquals("refreshToken", response.getRefreshToken());
        assertEquals(testUser.getEmail(), response.getEmail());
        assertEquals(testUser.getRole(), response.getRole());
        assertTrue(response.isInGracePeriod());
        
        verify(userRepository).existsByEmail("test@example.com");
        verify(userRepository).save(any(User.class));
        verify(verificationCodeService).generateCode(any(UUID.class), eq(VerificationCode.CodeType.EMAIL_VERIFICATION));
        verify(emailService).sendVerificationCode(eq("test@example.com"), eq("123456"), eq("Test User"));
    }

    @Test
    void register_EmailAlreadyExists_ThrowsException() {
        // Given
        when(userRepository.existsByEmail(anyString())).thenReturn(true);

        // When & Then
        assertThrows(EmailAlreadyExistsException.class, () -> authService.register(registerRequest));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void register_AdminRole_ThrowsException() {
        // Given
        registerRequest.setRole(Role.ADMIN);

        // When & Then
        assertThrows(BadRequestException.class, () -> authService.register(registerRequest));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void register_EmployerRole_RequiresApproval() {
        // Given
        registerRequest.setRole(Role.EMPLOYER);
        User employerUser = new User();
        employerUser.setId(UUID.randomUUID());
        employerUser.setRole(Role.EMPLOYER);
        employerUser.setApprovedByAdmin(false);
        employerUser.setEmail("employer@example.com");
        employerUser.setFullName("Employer User");
        employerUser.setGracePeriodEndsAt(LocalDateTime.now().plusDays(3));

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(employerUser);
        when(verificationCodeService.generateCode(any(UUID.class), any(VerificationCode.CodeType.class)))
                .thenReturn("123456");
        when(jwtService.generateAccessToken(any(UUID.class), anyString(), any(Role.class)))
                .thenReturn("accessToken");
        when(jwtService.generateRefreshToken(any(UUID.class))).thenReturn("refreshToken");

        // When
        AuthResponse response = authService.register(registerRequest);

        // Then
        assertTrue(response.isRequiresApproval());
    }

    @Test
    void login_Success() {
        // Given
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);
        when(jwtService.generateAccessToken(any(UUID.class), anyString(), any(Role.class)))
                .thenReturn("accessToken");
        when(jwtService.generateRefreshToken(any(UUID.class))).thenReturn("refreshToken");
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // When
        AuthResponse response = authService.login(loginRequest);

        // Then
        assertNotNull(response);
        assertEquals("accessToken", response.getAccessToken());
        assertEquals(testUser.getEmail(), response.getEmail());
        verify(userRepository).findByEmail("test@example.com");
        verify(passwordEncoder).matches("password123", "encodedPassword");
    }

    @Test
    void login_InvalidEmail_ThrowsException() {
        // Given
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        // When & Then
        assertThrows(InvalidCredentialsException.class, () -> authService.login(loginRequest));
        verify(passwordEncoder, never()).matches(anyString(), anyString());
    }

    @Test
    void login_InvalidPassword_ThrowsException() {
        // Given
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(false);

        // When & Then
        assertThrows(InvalidCredentialsException.class, () -> authService.login(loginRequest));
    }

    @Test
    void login_SuspendedAccount_ThrowsException() {
        // Given
        testUser.setAccountStatus(AccountStatus.SUSPENDED);
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);

        // When & Then
        assertThrows(ForbiddenException.class, () -> authService.login(loginRequest));
    }

    @Test
    void login_UnapprovedEmployer_ThrowsException() {
        // Given
        testUser.setRole(Role.EMPLOYER);
        testUser.setApprovedByAdmin(false);
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);

        // When & Then
        assertThrows(AccountNotApprovedException.class, () -> authService.login(loginRequest));
    }

    @Test
    void login_ExpiredGracePeriodNoSubscription_ThrowsException() {
        // Given
        testUser.setGracePeriodEndsAt(LocalDateTime.now().minusDays(1));
        testUser.setSubscriptionActive(false);
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);

        // When & Then
        assertThrows(ForbiddenException.class, () -> authService.login(loginRequest));
    }

    @Test
    void verifyEmail_Success() {
        // Given
        VerifyCodeRequest request = new VerifyCodeRequest();
        request.setCode("123456");

        testUser.setEmailVerified(false);
        when(userRepository.findById(any(UUID.class))).thenReturn(Optional.of(testUser));
        when(verificationCodeService.verifyCode(any(UUID.class), anyString(), any(VerificationCode.CodeType.class)))
                .thenReturn(true);
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // When
        authService.verifyEmail(testUser.getId(), request);

        // Then
        verify(verificationCodeService).verifyCode(testUser.getId(), "123456", VerificationCode.CodeType.EMAIL_VERIFICATION);
        verify(userRepository).save(testUser);
        verify(emailService).sendWelcomeEmail(testUser.getEmail(), testUser.getFullName());
    }

    @Test
    void verifyEmail_AlreadyVerified_ThrowsException() {
        // Given
        VerifyCodeRequest request = new VerifyCodeRequest();
        request.setCode("123456");

        testUser.setEmailVerified(true);
        when(userRepository.findById(any(UUID.class))).thenReturn(Optional.of(testUser));

        // When & Then
        assertThrows(BadRequestException.class, () -> authService.verifyEmail(testUser.getId(), request));
        verify(verificationCodeService, never()).verifyCode(any(), any(), any());
    }

    @Test
    void verifyEmail_InvalidCode_ThrowsException() {
        // Given
        VerifyCodeRequest request = new VerifyCodeRequest();
        request.setCode("000000");

        testUser.setEmailVerified(false);
        when(userRepository.findById(any(UUID.class))).thenReturn(Optional.of(testUser));
        when(verificationCodeService.verifyCode(any(UUID.class), anyString(), any(VerificationCode.CodeType.class)))
                .thenReturn(false);

        // When & Then
        assertThrows(InvalidVerificationCodeException.class, () -> authService.verifyEmail(testUser.getId(), request));
        verify(emailService, never()).sendWelcomeEmail(any(), any());
    }

    @Test
    void requestPasswordReset_Success() {
        // Given
        PasswordResetRequest request = new PasswordResetRequest();
        request.setEmail("test@example.com");

        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));
        when(verificationCodeService.generateCode(any(UUID.class), any(VerificationCode.CodeType.class)))
                .thenReturn("123456");

        // When
        authService.requestPasswordReset(request);

        // Then
        verify(verificationCodeService).generateCode(testUser.getId(), VerificationCode.CodeType.PASSWORD_RESET);
        verify(emailService).sendPasswordResetCode("test@example.com", "123456", "Test User");
    }

    @Test
    void requestPasswordReset_UserNotFound_ThrowsException() {
        // Given
        PasswordResetRequest request = new PasswordResetRequest();
        request.setEmail("notfound@example.com");

        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResourceNotFoundException.class, () -> authService.requestPasswordReset(request));
        verify(emailService, never()).sendPasswordResetCode(any(), any(), any());
    }

    @Test
    void resetPassword_Success() {
        // Given
        ResetPasswordConfirmRequest request = new ResetPasswordConfirmRequest();
        request.setCode("123456");
        request.setNewPassword("newPassword123");

        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));
        when(verificationCodeService.verifyCode(any(UUID.class), anyString(), any(VerificationCode.CodeType.class)))
                .thenReturn(true);
        when(passwordEncoder.encode(anyString())).thenReturn("newEncodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // When
        authService.resetPassword("test@example.com", request);

        // Then
        verify(verificationCodeService).verifyCode(testUser.getId(), "123456", VerificationCode.CodeType.PASSWORD_RESET);
        verify(passwordEncoder).encode("newPassword123");
        verify(userRepository).save(testUser);
    }

    @Test
    void resetPassword_InvalidCode_ThrowsException() {
        // Given
        ResetPasswordConfirmRequest request = new ResetPasswordConfirmRequest();
        request.setCode("000000");
        request.setNewPassword("newPassword123");

        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));
        when(verificationCodeService.verifyCode(any(UUID.class), anyString(), any(VerificationCode.CodeType.class)))
                .thenReturn(false);

        // When & Then
        assertThrows(InvalidVerificationCodeException.class, 
                () -> authService.resetPassword("test@example.com", request));
        verify(userRepository, never()).save(any());
    }

    @Test
    void resendVerificationCode_Success() {
        // Given
        testUser.setEmailVerified(false);
        when(userRepository.findById(any(UUID.class))).thenReturn(Optional.of(testUser));
        when(verificationCodeService.generateCode(any(UUID.class), any(VerificationCode.CodeType.class)))
                .thenReturn("654321");

        // When
        authService.resendVerificationCode(testUser.getId());

        // Then
        verify(verificationCodeService).generateCode(testUser.getId(), VerificationCode.CodeType.EMAIL_VERIFICATION);
        verify(emailService).sendVerificationCode("test@example.com", "654321", "Test User");
    }

    @Test
    void resendVerificationCode_AlreadyVerified_ThrowsException() {
        // Given
        testUser.setEmailVerified(true);
        when(userRepository.findById(any(UUID.class))).thenReturn(Optional.of(testUser));

        // When & Then
        assertThrows(BadRequestException.class, () -> authService.resendVerificationCode(testUser.getId()));
        verify(emailService, never()).sendVerificationCode(any(), any(), any());
    }
}

