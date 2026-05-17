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
import org.moseti.kedevsapi.users.repository.DeveloperProfileRepository;
import org.moseti.kedevsapi.users.repository.EmployerProfileRepository;
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
    private final GoogleOAuthService googleOAuthService;
    private final DeveloperProfileRepository developerProfileRepository;
    private final EmployerProfileRepository employerProfileRepository;

    @org.springframework.beans.factory.annotation.Autowired
    @org.springframework.context.annotation.Lazy
    private org.moseti.kedevsapi.notifications.service.NotificationService notificationService;

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


        user = userRepository.save(user);

        // Generate and send verification code
        String code = verificationCodeService.generateCode(user.getId(), VerificationCode.CodeType.EMAIL_VERIFICATION);
        emailService.sendVerificationCode(user.getEmail(), code, user.getFullName());

        log.info("User registered successfully: {}", user.getEmail());

        return AuthResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .emailVerified(false)
                .requiresApproval(request.getRole() == Role.EMPLOYER)
                .accountStatus(user.getAccountStatus().name())
                .build();
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
    public AuthResponse verifyEmail(UUID userId, VerifyCodeRequest request) {
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
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        // Send welcome email
        emailService.sendWelcomeEmail(user.getEmail(), user.getFullName());

        log.info("Email verified for user: {}", user.getEmail());

        // Generate tokens for immediate login
        String accessToken = jwtService.generateAccessToken(user.getId(), user.getEmail(), user.getRole());
        String refreshToken = createRefreshToken(user.getId());

        return buildAuthResponse(user, accessToken, refreshToken);
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
        log.info("Starting Google authentication flow...");
        // Verify the Google ID token
        var tokenInfo = googleOAuthService.verifyToken(request.getIdToken());
        log.info("Google token verified for email: {}", tokenInfo.getEmail());

        // Check if user exists
        var existingUser = userRepository.findByEmail(tokenInfo.getEmail());
        log.info("Google user lookup for email {}: found={}", tokenInfo.getEmail(), existingUser.isPresent());

        if (existingUser.isPresent()) {
            log.info("Linking existing user account for: {}", tokenInfo.getEmail());
            // User exists - log them in
            User user = existingUser.get();

            // Update Google ID if not set
            if (user.getGoogleId() == null) {
                user.setGoogleId(tokenInfo.getSub());
                user.setAuthProvider(AuthProvider.GOOGLE);
                user.setEmailVerified(true); // Google verified it
            }

            // Update last login
            user.setLastLoginAt(LocalDateTime.now());
            userRepository.save(user);

            // Validate user can login
            validateUserCanLogin(user);

            // Generate tokens
            log.debug("Generating tokens for existing user: {}", user.getId());
            String accessToken = jwtService.generateAccessToken(user.getId(), user.getEmail(), user.getRole());
            String refreshToken = createRefreshToken(user.getId());

            log.info("Google OAuth login successful for existing user: {}", user.getEmail());

            return buildAuthResponse(user, accessToken, refreshToken);
        } else {
            // New user - create account
            Role userRole = request.getRole() != null ? request.getRole() : Role.DEVELOPER;
            if (userRole == Role.ADMIN) {
                throw new org.moseti.kedevsapi.shared.exception.BadRequestException("Cannot register as admin via Google OAuth");
            }

            User newUser = new User();
            newUser.setEmail(tokenInfo.getEmail());
            newUser.setFullName(tokenInfo.getName() != null ? tokenInfo.getName() : tokenInfo.getEmail());
            newUser.setPassword(passwordEncoder.encode(UUID.randomUUID().toString())); // Random password
            newUser.setRole(userRole);
            newUser.setAuthProvider(AuthProvider.GOOGLE);
            newUser.setGoogleId(tokenInfo.getSub());
            newUser.setEmailVerified(true); // Google already verified
            newUser.setAccountStatus(AccountStatus.ACTIVE);
            newUser.setApprovedByAdmin(userRole == Role.DEVELOPER); // Employers need approval
            newUser.setLastLoginAt(LocalDateTime.now());

            log.info("Saving new Google user: email={}, role={}", newUser.getEmail(), newUser.getRole());
            newUser = userRepository.save(newUser);
            log.info("New Google user saved with ID: {}", newUser.getId());

            // Send welcome email (no verification needed)
            emailService.sendWelcomeEmail(newUser.getEmail(), newUser.getFullName());

            // Generate tokens
            String accessToken = jwtService.generateAccessToken(newUser.getId(), newUser.getEmail(), newUser.getRole());
            String refreshToken = createRefreshToken(newUser.getId());

            log.info("Google OAuth registration successful for new user: {}", newUser.getEmail());

            return buildAuthResponse(newUser, accessToken, refreshToken);
        }
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
        // Check if email is verified
        if (!user.isEmailVerified()) {
            throw new EmailNotVerifiedException("Email not verified. Please check your email for the verification code.", user.getId());
        }

        // Grace period and subscription gating is no longer enforced for current users.
    }

    private AuthResponse buildAuthResponse(User user, String accessToken, String refreshToken) {
        boolean onboarded = false;
        boolean isVerified = user.isApprovedByAdmin();
        boolean employerApproved = false;

        if (user.getRole() == Role.DEVELOPER) {
            var profile = developerProfileRepository.findByUserId(user.getId());
            onboarded = profile.isPresent();
            if (profile.isPresent()) {
                isVerified = profile.get().isVerified();
            }
        } else if (user.getRole() == Role.EMPLOYER) {
            var profile = employerProfileRepository.findByUserId(user.getId());
            onboarded = profile.isPresent();
            if (profile.isPresent()) {
                employerApproved = profile.get().isApproved();
                isVerified = employerApproved;
            }
        }

        // For employers, requiresApproval is driven by employer_profiles.is_approved
        boolean requiresApproval = user.getRole() == Role.EMPLOYER && !employerApproved;

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .emailVerified(user.isEmailVerified())
                .requiresApproval(requiresApproval)
                .onboarded(onboarded)
                .isVerified(isVerified)
                .accountStatus(user.getAccountStatus().name())
                .build();
    }

    @Transactional(readOnly = true)
    public AuthResponse getCurrentUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return buildAuthResponse(user, null, null);
    }

    @Transactional
    public void submitAppeal(UUID userId, String message) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        java.util.List<User> admins = userRepository.findByRole(Role.ADMIN);
        
        String title = "User Appeal Submitted";
        String notificationMsg = String.format("%s (%s) has contested their %s: %s",
                user.getFullName(),
                user.getEmail(),
                user.getAccountStatus() == AccountStatus.SUSPENDED ? "suspension" : "ban",
                message
        );
        
        String metadata = String.format("{\"appealingUserId\":\"%s\",\"accountStatus\":\"%s\"}", 
                user.getId(), 
                user.getAccountStatus().name()
        );
        
        for (User admin : admins) {
            notificationService.notify(
                    admin.getId(),
                    org.moseti.kedevsapi.shared.enums.NotificationCategory.ADMIN,
                    title,
                    notificationMsg,
                    metadata
            );
        }
        
        log.info("Appeal submitted by user: {} (ID: {}). Notified {} admins.", 
                user.getEmail(), user.getId(), admins.size());
    }
}
