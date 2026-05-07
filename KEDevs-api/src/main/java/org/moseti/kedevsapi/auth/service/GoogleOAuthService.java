package org.moseti.kedevsapi.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.moseti.kedevsapi.auth.dto.GoogleTokenInfo;
import org.moseti.kedevsapi.auth.exception.InvalidTokenException;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

@Slf4j
@Service
@RequiredArgsConstructor
public class GoogleOAuthService {

    private static final String GOOGLE_TOKEN_INFO_URL = "https://oauth2.googleapis.com/tokeninfo";
    private final WebClient.Builder webClientBuilder;

    @org.springframework.beans.factory.annotation.Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String googleClientId;

    /**
     * Verify Google ID token and extract user information
     * @param idToken The Google ID token to verify
     * @return GoogleTokenInfo containing user details
     * @throws InvalidTokenException if token is invalid or verification fails
     */
    public GoogleTokenInfo verifyToken(String idToken) {
        try {
            log.info("Attempting to verify Google token via tokeninfo...");
            GoogleTokenInfo tokenInfo = webClientBuilder.build()
                    .get()
                    .uri(uriBuilder -> uriBuilder
                            .scheme("https")
                            .host("oauth2.googleapis.com")
                            .path("/tokeninfo")
                            .queryParam("id_token", idToken)
                            .build())
                    .retrieve()
                    .bodyToMono(GoogleTokenInfo.class)
                    .block();

            if (tokenInfo != null) {
                validateTokenInfo(tokenInfo);
                log.info("Successfully verified Google id_token for email: {}", tokenInfo.getEmail());
                return tokenInfo;
            }
            throw new InvalidTokenException("Failed to verify Google token");

        } catch (WebClientResponseException e) {
            log.warn("Google tokeninfo verification failed ({}). Attempting userinfo fallback...", e.getStatusCode());
            
            // If tokeninfo fails, it might be an access_token. Try userinfo endpoint.
            try {
                GoogleTokenInfo userInfo = webClientBuilder.build()
                        .get()
                        .uri("https://www.googleapis.com/oauth2/v3/userinfo")
                        .header("Authorization", "Bearer " + idToken)
                        .retrieve()
                        .bodyToMono(GoogleTokenInfo.class)
                        .block();

                if (userInfo != null) {
                    // For userinfo, some fields like 'iss' and 'aud' are missing, so we skip standard JWT validation
                    if (userInfo.getEmail() == null || userInfo.getEmail().isEmpty()) {
                        throw new InvalidTokenException("Google userinfo does not contain email");
                    }
                    log.info("Successfully verified Google access_token via userinfo for email: {}", userInfo.getEmail());
                    return userInfo;
                }
            } catch (Exception ex) {
                log.error("Google userinfo fallback also failed: {}", ex.getMessage());
            }

            if (e.getStatusCode().is4xxClientError()) {
                throw new InvalidTokenException("Invalid Google ID token or credentials");
            }
            throw new RuntimeException("Google authentication service unavailable", e);
        } catch (Exception e) {
            log.error("Unexpected error verifying Google token", e);
            throw new RuntimeException("Failed to verify Google token: " + e.getMessage(), e);
        }
    }

    private void validateTokenInfo(GoogleTokenInfo tokenInfo) {
        // Verify email is present
        if (tokenInfo.getEmail() == null || tokenInfo.getEmail().isEmpty()) {
            throw new InvalidTokenException("Google token does not contain email");
        }

        // Verify email is verified by Google
        String isVerified = String.valueOf(tokenInfo.getEmailVerified());
        if (!"true".equalsIgnoreCase(isVerified)) {
            throw new InvalidTokenException("Google email is not verified");
        }

        // Verify issuer
        String issuer = tokenInfo.getIssuer();
        if (issuer == null ||
            (!issuer.equals("accounts.google.com") && !issuer.equals("https://accounts.google.com"))) {
            throw new InvalidTokenException("Invalid token issuer");
        }

        // Verify audience (must match our client ID)
        if (googleClientId != null && !googleClientId.isEmpty() &&
            !googleClientId.equals(tokenInfo.getAudience())) {
            log.error("Google token audience mismatch. Expected: {}, Got: {}", googleClientId, tokenInfo.getAudience());
            throw new InvalidTokenException("Token audience mismatch");
        }

        log.debug("Google token validated: email={}, sub={}", tokenInfo.getEmail(), tokenInfo.getSub());
    }
}

