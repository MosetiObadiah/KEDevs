package org.moseti.kedevsapi.auth.service;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.moseti.kedevsapi.shared.enums.Role;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

@Service
public class JwtService {

    @Value("${jwt.secret:your-256-bit-secret-key-for-jwt-token-generation-please-change-in-production}")
    private String jwtSecret;

    @Value("${jwt.expiration:3600000}") // 1 hour default
    private Long jwtExpiration;

    @Value("${jwt.refresh-expiration:604800000}") // 7 days default
    private Long refreshExpiration;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateAccessToken(UUID userId, String email, Role role) {
        return Jwts.builder()
                .subject(userId.toString())
                .claim("email", email)
                .claim("role", role.name())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + jwtExpiration))
                .signWith(getSigningKey())
                .compact();
    }

    public String generateRefreshToken(UUID userId) {
        return Jwts.builder()
                .subject(userId.toString())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + refreshExpiration))
                .signWith(getSigningKey())
                .compact();
    }

    public UUID extractUserId(String token) {
        String userIdString = extractClaims(token).getSubject();
        return UUID.fromString(userIdString);
    }

    public String extractEmail(String token) {
        return extractClaims(token).get("email", String.class);
    }

    public Role extractRole(String token) {
        String roleString = extractClaims(token).get("role", String.class);
        return Role.valueOf(roleString);
    }

    public boolean isTokenValid(String token) {
        try {
            extractClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public boolean isTokenExpired(String token) {
        try {
            return extractClaims(token).getExpiration().before(new Date());
        } catch (JwtException e) {
            return true;
        }
    }

    private Claims extractClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}

