package org.moseti.kedevsapi.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.moseti.kedevsapi.auth.dto.*;
import org.moseti.kedevsapi.auth.entity.RefreshToken;
import org.moseti.kedevsapi.auth.entity.VerificationCode;
import org.moseti.kedevsapi.auth.exception.*;
import org.moseti.kedevsapi.auth.repository.RefreshTokenRepository;
import org.moseti.kedevsapi.shared.enums.AccountStatus;
import org.moseti.kedevsapi.shared.enums.AuthProvider;
import org.moseti.kedevsapi.shared.enums.Role;
import org.moseti.kedevsapi.shared.exception.ResourceNotFoundException;
import org.moseti.kedevsapi.shared.util.Constants;
import org.moseti.kedevsapi.users.entity.User;
import org.moseti.kedevsapi.users.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final VerificationCodeService verificationCodeService;
    private final EmailService emailService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("Email already registered");
        }

        // Validate role - prevent admin creation through registration
        if (request.getRole() == Role.ADMIN) {
            throw new org.moseti.kedevsapi.shared.exception.BadRequestException("Cannot register as admin");
        }

        // Create user
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setRole(request.getRole());
        user.setAuthProvider(AuthProvider.LOCAL);
        user.setEmailVerified(false);
        user.setAccountStatus(AccountStatus.ACTIVE);

        // Set approval status - employers need admin approval
        user.setApprovedByAdmin(request.getRole() == Role.DEVELOPER);

        // Set grace period
        user.setGracePeriodEndsAt(LocalDateTime.now().plusDays(Constants.GRACE_PERIOD_DAYS));

        user = userRepository.save(user);

        // Generate and send verification code
        String code = verificationCodeService.generateCode(user.getId(), VerificationCode.CodeType.EMAIL_VERIFICATION);
        emailService.sendVerificationCode(user.getEmail(), code, user.getFullName());

        log.info("User registered successfully: {}", user.getEmail());

        // Generate tokens
        String accessToken = jwtService.generateAccessToken(user.getId(), user.getEmail(), user.getRole());
        String refreshToken = createRefreshToken(user.getId());

        return buildAuthResponse(user, accessToken, refreshToken);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        validateUserCanLogin(user);

        // Update last login
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        // Generate tokens
        String accessToken = jwtService.generateAccessToken(user.getId(), user.getEmail(), user.getRole());
        String refreshToken = createRefreshToken(user.getId());

        log.info("User logged in: {}", user.getEmail());

        return buildAuthResponse(user, accessToken, refreshToken);
    }

    @Transactional
    public void verifyEmail(UUID userId, VerifyCodeRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.isEmailVerified()) {
            throw new org.moseti.kedevsapi.shared.exception.BadRequestException("Email already verified");
        }

        boolean isValid = verificationCodeService.verifyCode(
                userId,
                request.getCode(),
                VerificationCode.CodeType.EMAIL_VERIFICATION
        );

        if (!isValid) {
            throw new InvalidVerificationCodeException("Invalid or expired verification code");
        }

        user.setEmailVerified(true);
        userRepository.save(user);

        // Send welcome email
        emailService.sendWelcomeEmail(user.getEmail(), user.getFullName());

        log.info("Email verified for user: {}", user.getEmail());
    }

    @Transactional
    public void resendVerificationCode(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.isEmailVerified()) {
            throw new org.moseti.kedevsapi.shared.exception.BadRequestException("Email already verified");
        }

        String code = verificationCodeService.generateCode(user.getId(), VerificationCode.CodeType.EMAIL_VERIFICATION);
        emailService.sendVerificationCode(user.getEmail(), code, user.getFullName());

        log.info("Verification code resent to: {}", user.getEmail());
    }

    @Transactional
    public void requestPasswordReset(PasswordResetRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Email not found"));

        String code = verificationCodeService.generateCode(user.getId(), VerificationCode.CodeType.PASSWORD_RESET);
        emailService.sendPasswordResetCode(user.getEmail(), code, user.getFullName());

        log.info("Password reset requested for: {}", user.getEmail());
    }

    @Transactional
    public void resetPassword(String email, ResetPasswordConfirmRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        boolean isValid = verificationCodeService.verifyCode(
                user.getId(),
                request.getCode(),
                VerificationCode.CodeType.PASSWORD_RESET
        );

        if (!isValid) {
            throw new InvalidVerificationCodeException("Invalid or expired reset code");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        log.info("Password reset successful for: {}", user.getEmail());
    }

    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new InvalidTokenException("Invalid refresh token"));

        if (refreshToken.isRevoked()) {
            throw new InvalidTokenException("Refresh token has been revoked");
        }

        if (refreshToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new InvalidTokenException("Refresh token has expired");
        }

        User user = userRepository.findById(refreshToken.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        validateUserCanLogin(user);

        // Generate new access token
        String newAccessToken = jwtService.generateAccessToken(user.getId(), user.getEmail(), user.getRole());

        log.info("Token refreshed for user: {}", user.getEmail());

        return buildAuthResponse(user, newAccessToken, request.getRefreshToken());
    }

    @Transactional
    public void logout(String refreshToken) {
        refreshTokenRepository.findByToken(refreshToken)
                .ifPresent(token -> {
                    token.setRevoked(true);
                    refreshTokenRepository.save(token);
                    log.info("User logged out, token revoked");
                });
    }

    @Transactional
    public AuthResponse googleAuth(GoogleAuthRequest request) {
        // TODO: Implement Google OAuth verification with Google API
        // For now, throw not implemented
        throw new org.moseti.kedevsapi.shared.exception.BadRequestException(
                "Google OAuth integration coming soon"
        );
    }

    private String createRefreshToken(UUID userId) {
        String token = jwtService.generateRefreshToken(userId);

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken(token);
        refreshToken.setUserId(userId);
        refreshToken.setExpiresAt(LocalDateTime.now().plusDays(7));

        refreshTokenRepository.save(refreshToken);
        return token;
    }

    private void validateUserCanLogin(User user) {
        // Check if account is active
        if (user.getAccountStatus() != AccountStatus.ACTIVE) {
            throw new org.moseti.kedevsapi.shared.exception.ForbiddenException(
                    "Account is " + user.getAccountStatus()
            );
        }

        // Check if employer is approved
        if (user.getRole() == Role.EMPLOYER && !user.isApprovedByAdmin()) {
            throw new AccountNotApprovedException("Your employer account is pending admin approval");
        }

        // Check grace period and subscription
        LocalDateTime now = LocalDateTime.now();
        boolean gracePeriodExpired = user.getGracePeriodEndsAt() != null &&
                                     user.getGracePeriodEndsAt().isBefore(now);

        if (gracePeriodExpired && !user.isSubscriptionActive()) {
            throw new org.moseti.kedevsapi.shared.exception.ForbiddenException(
                    "Your grace period has expired. Please renew your subscription to continue."
            );
        }
    }

    private AuthResponse buildAuthResponse(User user, String accessToken, String refreshToken) {
        LocalDateTime now = LocalDateTime.now();
        boolean inGracePeriod = user.getGracePeriodEndsAt() != null &&
                                user.getGracePeriodEndsAt().isAfter(now) &&
                                !user.isSubscriptionActive();

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .emailVerified(user.isEmailVerified())
                .requiresApproval(user.getRole() == Role.EMPLOYER && !user.isApprovedByAdmin())
                .inGracePeriod(inGracePeriod)
                .build();
    }
}

