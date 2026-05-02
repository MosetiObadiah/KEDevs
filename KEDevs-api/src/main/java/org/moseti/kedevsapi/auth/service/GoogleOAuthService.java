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

            if (tokenInfo == null) {
                log.error("Google token verification returned null");
                throw new InvalidTokenException("Failed to verify Google token");
            }

            // Verify the token is valid
            validateTokenInfo(tokenInfo);

            log.info("Successfully verified Google token for email: {}", tokenInfo.getEmail());
            return tokenInfo;

        } catch (WebClientResponseException e) {
            log.error("Google API error: {} - {} - Response: {}", 
                e.getStatusCode(), e.getMessage(), e.getResponseBodyAsString());
            
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

