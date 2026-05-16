package org.moseti.kedevsapi.auth.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.moseti.kedevsapi.auth.dto.GoogleAuthRequest;
import org.moseti.kedevsapi.auth.dto.GoogleTokenInfo;
import org.moseti.kedevsapi.auth.dto.AuthResponse;
import org.moseti.kedevsapi.auth.exception.InvalidTokenException;
import org.moseti.kedevsapi.shared.enums.AuthProvider;
import org.moseti.kedevsapi.shared.enums.Role;
import org.moseti.kedevsapi.shared.exception.BadRequestException;
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
class GoogleOAuthIntegrationTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private GoogleOAuthService googleOAuthService;

    @Mock
    private JwtService jwtService;

    @Mock
    private EmailService emailService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private VerificationCodeService verificationCodeService;

    @Mock
    private org.moseti.kedevsapi.auth.repository.RefreshTokenRepository refreshTokenRepository;

    @InjectMocks
    private AuthService authService;

    private GoogleAuthRequest googleAuthRequest;
    private GoogleTokenInfo googleTokenInfo;
    private User existingUser;

    @BeforeEach
    void setUp() {
        googleAuthRequest = new GoogleAuthRequest();
        googleAuthRequest.setIdToken("valid-google-token");
        googleAuthRequest.setRole(Role.DEVELOPER);

        googleTokenInfo = new GoogleTokenInfo();
        googleTokenInfo.setSub("google-user-id-123");
        googleTokenInfo.setEmail("user@gmail.com");
        googleTokenInfo.setName("Test User");
        googleTokenInfo.setEmailVerified("true");
        googleTokenInfo.setIssuer("accounts.google.com");

        existingUser = new User();
        existingUser.setId(UUID.randomUUID());
        existingUser.setEmail("user@gmail.com");
        existingUser.setFullName("Existing User");
        existingUser.setRole(Role.DEVELOPER);
        existingUser.setAuthProvider(AuthProvider.LOCAL);
        existingUser.setEmailVerified(true);
    }

    @Test
    void googleAuth_ExistingUser_Success() {
        // Given
        when(googleOAuthService.verifyToken(anyString())).thenReturn(googleTokenInfo);
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(existingUser));
        when(userRepository.save(any(User.class))).thenReturn(existingUser);
        when(jwtService.generateAccessToken(any(), anyString(), any())).thenReturn("access-token");
        when(jwtService.generateRefreshToken(any())).thenReturn("refresh-token");

        // When
        AuthResponse response = authService.googleAuth(googleAuthRequest);

        // Then
        assertNotNull(response);
        assertEquals("user@gmail.com", response.getEmail());
        assertEquals("access-token", response.getAccessToken());
        verify(googleOAuthService).verifyToken("valid-google-token");
        verify(userRepository).findByEmail("user@gmail.com");
        verify(userRepository).save(any(User.class));
        verify(emailService, never()).sendWelcomeEmail(any(), any());
    }

    @Test
    void googleAuth_NewUser_CreatesAccount() {
        // Given
        when(googleOAuthService.verifyToken(anyString())).thenReturn(googleTokenInfo);
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(anyString())).thenReturn("encoded-random-password");

        User newUser = new User();
        newUser.setId(UUID.randomUUID());
        newUser.setEmail(googleTokenInfo.getEmail());
        newUser.setFullName(googleTokenInfo.getName());
        newUser.setRole(Role.DEVELOPER);

        when(userRepository.save(any(User.class))).thenReturn(newUser);
        when(jwtService.generateAccessToken(any(), anyString(), any())).thenReturn("access-token");
        when(jwtService.generateRefreshToken(any())).thenReturn("refresh-token");

        // When
        AuthResponse response = authService.googleAuth(googleAuthRequest);

        // Then
        assertNotNull(response);
        assertEquals("user@gmail.com", response.getEmail());
        verify(googleOAuthService).verifyToken("valid-google-token");
        verify(userRepository).save(argThat(user ->
                user.getAuthProvider() == AuthProvider.GOOGLE &&
                user.getGoogleId().equals("google-user-id-123") &&
                user.isEmailVerified() &&
                user.getRole() == Role.DEVELOPER
        ));
        verify(emailService).sendWelcomeEmail(googleTokenInfo.getEmail(), googleTokenInfo.getName());
    }

    @Test
    void googleAuth_NewUserWithoutRole_ThrowsException() {
        // Given
        googleAuthRequest.setRole(null);
        when(googleOAuthService.verifyToken(anyString())).thenReturn(googleTokenInfo);
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        // When & Then
        assertThrows(BadRequestException.class, () -> authService.googleAuth(googleAuthRequest));
        verify(userRepository, never()).save(any());
    }

    @Test
    void googleAuth_NewUserWithAdminRole_ThrowsException() {
        // Given
        googleAuthRequest.setRole(Role.ADMIN);
        when(googleOAuthService.verifyToken(anyString())).thenReturn(googleTokenInfo);
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        // When & Then
        assertThrows(BadRequestException.class, () -> authService.googleAuth(googleAuthRequest));
        verify(userRepository, never()).save(any());
    }

    @Test
    void googleAuth_InvalidToken_ThrowsException() {
        // Given
        when(googleOAuthService.verifyToken(anyString()))
                .thenThrow(new InvalidTokenException("Invalid Google ID token"));

        // When & Then
        assertThrows(InvalidTokenException.class, () -> authService.googleAuth(googleAuthRequest));
        verify(userRepository, never()).findByEmail(any());
    }

    @Test
    void googleAuth_NewEmployer_RequiresApproval() {
        // Given
        googleAuthRequest.setRole(Role.EMPLOYER);
        when(googleOAuthService.verifyToken(anyString())).thenReturn(googleTokenInfo);
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(anyString())).thenReturn("encoded-password");

        User newEmployer = new User();
        newEmployer.setId(UUID.randomUUID());
        newEmployer.setEmail(googleTokenInfo.getEmail());
        newEmployer.setRole(Role.EMPLOYER);
        newEmployer.setApprovedByAdmin(false);

        when(userRepository.save(any(User.class))).thenReturn(newEmployer);
        when(jwtService.generateAccessToken(any(), anyString(), any())).thenReturn("access-token");
        when(jwtService.generateRefreshToken(any())).thenReturn("refresh-token");

        // When
        AuthResponse response = authService.googleAuth(googleAuthRequest);

        // Then
        assertNotNull(response);
        assertTrue(response.isRequiresApproval());
        verify(userRepository).save(argThat(user ->
                user.getRole() == Role.EMPLOYER &&
                !user.isApprovedByAdmin()
        ));
    }
}

