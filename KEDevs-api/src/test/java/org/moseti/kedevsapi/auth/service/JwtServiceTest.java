package org.moseti.kedevsapi.auth.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.moseti.kedevsapi.shared.enums.Role;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;
    private UUID testUserId;
    private String testEmail;
    private Role testRole;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();

        // Set test properties using reflection
        ReflectionTestUtils.setField(jwtService, "jwtSecret",
                "test-secret-key-for-jwt-token-generation-must-be-at-least-256-bits-long");
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", 3600000L); // 1 hour
        ReflectionTestUtils.setField(jwtService, "refreshExpiration", 604800000L); // 7 days

        testUserId = UUID.randomUUID();
        testEmail = "test@example.com";
        testRole = Role.DEVELOPER;
    }

    @Test
    void generateAccessToken_Success() {
        // When
        String token = jwtService.generateAccessToken(testUserId, testEmail, testRole);

        // Then
        assertNotNull(token);
        assertFalse(token.isEmpty());
        assertTrue(token.split("\\.").length == 3); // JWT has 3 parts
    }

    @Test
    void generateRefreshToken_Success() {
        // When
        String token = jwtService.generateRefreshToken(testUserId);

        // Then
        assertNotNull(token);
        assertFalse(token.isEmpty());
        assertTrue(token.split("\\.").length == 3);
    }

    @Test
    void extractUserId_Success() {
        // Given
        String token = jwtService.generateAccessToken(testUserId, testEmail, testRole);

        // When
        UUID extractedUserId = jwtService.extractUserId(token);

        // Then
        assertEquals(testUserId, extractedUserId);
    }

    @Test
    void extractEmail_Success() {
        // Given
        String token = jwtService.generateAccessToken(testUserId, testEmail, testRole);

        // When
        String extractedEmail = jwtService.extractEmail(token);

        // Then
        assertEquals(testEmail, extractedEmail);
    }

    @Test
    void extractRole_Success() {
        // Given
        String token = jwtService.generateAccessToken(testUserId, testEmail, testRole);

        // When
        Role extractedRole = jwtService.extractRole(token);

        // Then
        assertEquals(testRole, extractedRole);
    }

    @Test
    void isTokenValid_ValidToken_ReturnsTrue() {
        // Given
        String token = jwtService.generateAccessToken(testUserId, testEmail, testRole);

        // When
        boolean isValid = jwtService.isTokenValid(token);

        // Then
        assertTrue(isValid);
    }

    @Test
    void isTokenValid_InvalidToken_ReturnsFalse() {
        // Given
        String invalidToken = "invalid.token.here";

        // When
        boolean isValid = jwtService.isTokenValid(invalidToken);

        // Then
        assertFalse(isValid);
    }

    @Test
    void isTokenExpired_NewToken_ReturnsFalse() {
        // Given
        String token = jwtService.generateAccessToken(testUserId, testEmail, testRole);

        // When
        boolean isExpired = jwtService.isTokenExpired(token);

        // Then
        assertFalse(isExpired);
    }

    @Test
    void refreshToken_ContainsUserId() {
        // Given
        String refreshToken = jwtService.generateRefreshToken(testUserId);

        // When
        UUID extractedUserId = jwtService.extractUserId(refreshToken);

        // Then
        assertEquals(testUserId, extractedUserId);
        assertTrue(jwtService.isTokenValid(refreshToken));
    }

    @Test
    void accessToken_ContainsAllClaims() {
        // Given
        String accessToken = jwtService.generateAccessToken(testUserId, testEmail, testRole);

        // When & Then
        assertDoesNotThrow(() -> {
            UUID userId = jwtService.extractUserId(accessToken);
            String email = jwtService.extractEmail(accessToken);
            Role role = jwtService.extractRole(accessToken);

            assertEquals(testUserId, userId);
            assertEquals(testEmail, email);
            assertEquals(testRole, role);
        });
    }
}






