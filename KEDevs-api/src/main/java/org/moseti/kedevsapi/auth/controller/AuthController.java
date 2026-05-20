package org.moseti.kedevsapi.auth.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.moseti.kedevsapi.auth.dto.*;
import org.moseti.kedevsapi.auth.service.AuthService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication")
public class AuthController {

    private final AuthService authService;

    @Value("${auth.cookies.secure}")
    private boolean secureCookies;

    // ====================== Cookie helpers ======================

    /**
     * Sets httpOnly access_token and refresh_token cookies on the response.
     *
     * - access_token: broad path (/), short-lived (15 min), sent with every request.
     * - refresh_token: narrow path (/api/v1/auth/refresh), long-lived (7 days),
     *   only sent to the refresh endpoint — reduces exposure if access token is somehow read.
     *
     * access_token uses SameSite=Lax always: Google OAuth redirects are cross-site top-level
     * navigations — Strict would drop the cookie and land the user without a session.
     * refresh_token uses SameSite=Strict in production: it only travels from your own frontend
     * to /api/v1/auth/refresh, never from an OAuth redirect, so Strict is safe and preferred.
     */
    private void setAuthCookies(HttpServletResponse response, String accessToken, String refreshToken) {
        // Lax always — OAuth redirects are cross-site top-level navigations; Strict drops the cookie.
        ResponseCookie access = ResponseCookie.from("access_token", accessToken)
                .httpOnly(true)
                .secure(secureCookies)
                .sameSite("Lax")
                .path("/")
                .maxAge(Duration.ofMinutes(15))
                .build();

        // Strict in prod (cross-site POST/XHR blocked); Lax in dev (avoids issues with local redirects).
        String refreshSameSite = secureCookies ? "Strict" : "Lax";
        ResponseCookie refresh = ResponseCookie.from("refresh_token", refreshToken)
                .httpOnly(true)
                .secure(secureCookies)
                .sameSite(refreshSameSite)
                .path("/api/v1/auth/refresh")
                .maxAge(Duration.ofDays(7))
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, access.toString());
        response.addHeader(HttpHeaders.SET_COOKIE, refresh.toString());
    }

    /** Expires both auth cookies immediately — used on logout. */
    private void clearAuthCookies(HttpServletResponse response) {
        ResponseCookie access = ResponseCookie.from("access_token", "")
                .httpOnly(true).secure(secureCookies).sameSite("Lax")
                .path("/").maxAge(0).build();
        ResponseCookie refresh = ResponseCookie.from("refresh_token", "")
                .httpOnly(true).secure(secureCookies).sameSite("Lax")
                .path("/api/v1/auth/refresh").maxAge(0).build();
        response.addHeader(HttpHeaders.SET_COOKIE, access.toString());
        response.addHeader(HttpHeaders.SET_COOKIE, refresh.toString());
    }

    // ====================== Endpoints ======================

    @Operation(summary = "Register a new developer or employer account", security = {})
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Registration successful"),
        @ApiResponse(responseCode = "400", description = "Email already taken or validation error")
    })
    @PostMapping("/register")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request,
            HttpServletResponse response) {
        AuthResponse auth = authService.register(request);
        setAuthCookies(response, auth.getAccessToken(), auth.getRefreshToken());
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success(
                "Registration successful. Please verify your email.", auth.withoutTokens()));
    }

    @Operation(summary = "Login with email and password", security = {})
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Login successful"),
        @ApiResponse(responseCode = "401", description = "Invalid credentials"),
        @ApiResponse(responseCode = "403", description = "Email not verified or account pending approval")
    })
    @PostMapping("/login")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse response) {
        AuthResponse auth = authService.login(request);
        setAuthCookies(response, auth.getAccessToken(), auth.getRefreshToken());
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success(
                "Login successful", auth.withoutTokens()));
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
            @Valid @RequestBody VerifyCodeRequest request,
            HttpServletResponse response) {
        AuthResponse auth = authService.verifyEmail(userId, request);
        setAuthCookies(response, auth.getAccessToken(), auth.getRefreshToken());
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success(
                "Email verified successfully", auth.withoutTokens()));
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
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<Void>> requestPasswordReset(
            @Valid @RequestBody PasswordResetRequest request) {
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

    @Operation(summary = "Exchange refresh token cookie for new access token", security = {},
               description = "The refresh_token httpOnly cookie is read automatically — no request body needed.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Token refreshed successfully"),
        @ApiResponse(responseCode = "401", description = "Missing, invalid, or expired refresh token")
    })
    @PostMapping("/refresh")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<Void>> refreshToken(
            @CookieValue(name = "refresh_token", required = false) String refreshToken,
            HttpServletResponse response) {
        if (refreshToken == null || refreshToken.isBlank()) {
            return ResponseEntity.status(401).body(
                    org.moseti.kedevsapi.shared.dto.ApiResponse.error("No refresh token present. Please log in again."));
        }
        RefreshTokenRequest req = new RefreshTokenRequest();
        req.setRefreshToken(refreshToken);
        AuthResponse auth = authService.refreshToken(req);
        setAuthCookies(response, auth.getAccessToken(), auth.getRefreshToken());
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Token refreshed"));
    }

    @Operation(summary = "Invalidate session cookies and refresh token", security = {})
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Logged out successfully")
    })
    @PostMapping("/logout")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<Void>> logout(
            @CookieValue(name = "refresh_token", required = false) String refreshToken,
            HttpServletResponse response) {
        if (refreshToken != null && !refreshToken.isBlank()) {
            authService.logout(refreshToken);
        }
        clearAuthCookies(response);
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
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<AuthResponse>> googleAuth(
            @Valid @RequestBody GoogleAuthRequest request,
            HttpServletResponse response) {
        AuthResponse auth = authService.googleAuth(request);
        setAuthCookies(response, auth.getAccessToken(), auth.getRefreshToken());
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success(
                "Google authentication successful", auth.withoutTokens()));
    }

    @Operation(summary = "Get current authenticated user status and details")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Current user retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @GetMapping("/me")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<AuthResponse>> getCurrentUser() {
        org.springframework.security.core.Authentication authentication =
                org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || authentication.getPrincipal() instanceof String) {
            return ResponseEntity.status(401).body(org.moseti.kedevsapi.shared.dto.ApiResponse.error("Unauthorized"));
        }
        UUID userId = (UUID) authentication.getPrincipal();
        AuthResponse response = authService.getCurrentUser(userId);
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success(
                "Current user fetched successfully", response.withoutTokens()));
    }

    @Operation(summary = "Submit a contestation / appeal message for suspension or ban")
    @PostMapping("/appeal")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<Void>> submitAppeal(
            @Valid @RequestBody AppealRequest request) {
        org.springframework.security.core.Authentication authentication =
                org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || authentication.getPrincipal() instanceof String) {
            return ResponseEntity.status(401).body(org.moseti.kedevsapi.shared.dto.ApiResponse.error("Unauthorized"));
        }
        UUID userId = (UUID) authentication.getPrincipal();
        authService.submitAppeal(userId, request.getMessage());
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success(
                "Appeal submitted successfully. Our administration team will review it."));
    }
}
