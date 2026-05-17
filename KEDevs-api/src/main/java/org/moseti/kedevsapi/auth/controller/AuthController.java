package org.moseti.kedevsapi.auth.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.moseti.kedevsapi.auth.dto.*;
import org.moseti.kedevsapi.auth.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication")
public class AuthController {

    private final AuthService authService;

    @Operation(summary = "Register a new developer or employer account", security = {})
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Registration successful"),
        @ApiResponse(responseCode = "400", description = "Email already taken or validation error")
    })
    @PostMapping("/register")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Registration successful. Please verify your email.", response));
    }

    @Operation(summary = "Login with email and password", security = {})
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Login successful"),
        @ApiResponse(responseCode = "401", description = "Invalid credentials"),
        @ApiResponse(responseCode = "403", description = "Email not verified or account pending approval")
    })
    @PostMapping("/login")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Login successful", response));
    }

    @Operation(summary = "Submit 6-digit email verification code", security = {})
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Email verified successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid or expired verification code"),
        @ApiResponse(responseCode = "404", description = "User not found")
    })
    @PostMapping("/verify-email/{userId}")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<AuthResponse>> verifyEmail(
            @Parameter(description = "ID of the user to verify") @PathVariable UUID userId,
            @Valid @RequestBody VerifyCodeRequest request) {
        AuthResponse response = authService.verifyEmail(userId, request);
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Email verified successfully", response));
    }

    @Operation(summary = "Resend email verification code", security = {})
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Verification code sent"),
        @ApiResponse(responseCode = "400", description = "Cannot resend code at this time"),
        @ApiResponse(responseCode = "404", description = "User not found")
    })
    @PostMapping("/resend-verification/{userId}")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<Void>> resendVerificationCode(
            @Parameter(description = "ID of the user to resend code to") @PathVariable UUID userId) {
        authService.resendVerificationCode(userId);
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Verification code sent to your email"));
    }

    @Operation(summary = "Request password reset code by email", security = {})
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Request processed (always returns 200 to prevent account enumeration)")
    })
    @PostMapping("/password-reset/request")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<Void>> requestPasswordReset(@Valid @RequestBody PasswordResetRequest request) {
        authService.requestPasswordReset(request);
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Password reset code sent to your email"));
    }

    @Operation(summary = "Submit reset code and new password", security = {})
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Password reset successful"),
        @ApiResponse(responseCode = "400", description = "Invalid or expired reset code")
    })
    @PostMapping("/password-reset/confirm")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<Void>> resetPassword(
            @Parameter(description = "Email of the user") @RequestParam String email,
            @Valid @RequestBody ResetPasswordConfirmRequest request) {
        authService.resetPassword(email, request);
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Password reset successful"));
    }

    @Operation(summary = "Exchange refresh token for new access token", security = {})
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Token refreshed successfully"),
        @ApiResponse(responseCode = "401", description = "Invalid or expired refresh token")
    })
    @PostMapping("/refresh")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<AuthResponse>> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        AuthResponse response = authService.refreshToken(request);
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Token refreshed", response));
    }

    @Operation(summary = "Invalidate refresh token", security = {})
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Logged out successfully")
    })
    @PostMapping("/logout")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<Void>> logout(@Valid @RequestBody RefreshTokenRequest request) {
        authService.logout(request.getRefreshToken());
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Logged out successfully"));
    }

    @Operation(summary = "Sign in or register via Google ID token", 
               description = "Pass Google ID token from client SDK. Include `role` only for new users.",
               security = {})
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Google authentication successful"),
        @ApiResponse(responseCode = "400", description = "Invalid Google token")
    })
    @PostMapping("/google")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<AuthResponse>> googleAuth(@Valid @RequestBody GoogleAuthRequest request) {
        AuthResponse response = authService.googleAuth(request);
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Google authentication successful", response));
    }

    @Operation(summary = "Get current authenticated user status and details")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Current user retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @GetMapping("/me")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<AuthResponse>> getCurrentUser() {
        org.springframework.security.core.Authentication authentication = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal() instanceof String) {
            return ResponseEntity.status(401).body(org.moseti.kedevsapi.shared.dto.ApiResponse.error("Unauthorized"));
        }
        UUID userId = (UUID) authentication.getPrincipal();
        AuthResponse response = authService.getCurrentUser(userId);
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Current user fetched successfully", response));
    }

    @Operation(summary = "Submit a contestation / appeal message for suspension or ban")
    @PostMapping("/appeal")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<Void>> submitAppeal(
            @Valid @RequestBody AppealRequest request) {
        org.springframework.security.core.Authentication authentication = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal() instanceof String) {
            return ResponseEntity.status(401).body(org.moseti.kedevsapi.shared.dto.ApiResponse.error("Unauthorized"));
        }
        UUID userId = (UUID) authentication.getPrincipal();
        authService.submitAppeal(userId, request.getMessage());
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Appeal submitted successfully. Our administration team will review it."));
    }
}
