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

        } catch (WebClientResponseException.BadRequest e) {
            log.error("Invalid Google token: {}", e.getMessage());
            throw new InvalidTokenException("Invalid Google ID token");
        } catch (WebClientResponseException e) {
            log.error("Google API error: {} - {}", e.getStatusCode(), e.getMessage());
            throw new RuntimeException("Google authentication service unavailable", e);
        } catch (Exception e) {
            log.error("Unexpected error verifying Google token", e);
            throw new RuntimeException("Failed to verify Google token", e);
        }
    }

    private void validateTokenInfo(GoogleTokenInfo tokenInfo) {
        // Verify email is present
        if (tokenInfo.getEmail() == null || tokenInfo.getEmail().isEmpty()) {
            throw new InvalidTokenException("Google token does not contain email");
        }

        // Verify email is verified by Google
        if (!"true".equalsIgnoreCase(tokenInfo.getEmailVerified())) {
            throw new InvalidTokenException("Google email is not verified");
        }

        // Verify issuer
        String issuer = tokenInfo.getIssuer();
        if (issuer == null ||
            (!issuer.equals("accounts.google.com") && !issuer.equals("https://accounts.google.com"))) {
            throw new InvalidTokenException("Invalid token issuer");
        }

        log.debug("Google token validated: email={}, sub={}", tokenInfo.getEmail(), tokenInfo.getSub());
    }
}

