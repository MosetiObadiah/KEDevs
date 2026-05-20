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

    // Google deprecated the tokeninfo endpoint for ID tokens.
    // The current recommended approach is the userinfo endpoint with a Bearer token.
    private static final String GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

    private final WebClient.Builder webClientBuilder;

    /**
     * Verifies a Google ID token and returns the associated user profile.
     * Uses the userinfo endpoint directly (tokeninfo is deprecated and returns 400).
     *
     * @param idToken  The Google ID/access token from the client SDK
     * @return         GoogleTokenInfo containing user details (email, name, sub, etc.)
     * @throws InvalidTokenException if the token is invalid or email is missing/unverified
     */
    public GoogleTokenInfo verifyToken(String idToken) {
        try {
            log.debug("Verifying Google token via userinfo endpoint...");

            GoogleTokenInfo userInfo = webClientBuilder.build()
                    .get()
                    .uri(GOOGLE_USERINFO_URL)
                    .header("Authorization", "Bearer " + idToken)
                    .retrieve()
                    .bodyToMono(GoogleTokenInfo.class)
                    .block();

            if (userInfo == null) {
                throw new InvalidTokenException("Google userinfo returned an empty response");
            }

            if (userInfo.getEmail() == null || userInfo.getEmail().isEmpty()) {
                throw new InvalidTokenException("Google token does not contain an email address");
            }

            String isVerified = String.valueOf(userInfo.getEmailVerified());
            if (!"true".equalsIgnoreCase(isVerified)) {
                throw new InvalidTokenException("Google account email is not verified");
            }

            log.info("Google token verified for email: {}", userInfo.getEmail());
            return userInfo;

        } catch (WebClientResponseException e) {
            log.warn("Google userinfo request failed ({}): {}", e.getStatusCode(), e.getMessage());
            if (e.getStatusCode().is4xxClientError()) {
                throw new InvalidTokenException("Invalid or expired Google token");
            }
            throw new RuntimeException("Google authentication service unavailable", e);
        } catch (InvalidTokenException e) {
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error verifying Google token", e);
            throw new RuntimeException("Failed to verify Google token: " + e.getMessage(), e);
        }
    }
}

