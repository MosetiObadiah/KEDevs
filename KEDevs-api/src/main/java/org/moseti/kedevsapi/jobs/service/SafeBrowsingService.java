package org.moseti.kedevsapi.jobs.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;

/**
 * Service integrating Google Safe Browsing API v4 to check external URL safety.
 * 
 * NOTE: The free Google Safe Browsing Lookup API used here is intended for
 * development/demonstration purposes only and NOT for commercial usage.
 * For fully production commercial deployments, switch to Web Risk API or another commercial solution.
 */
@Slf4j
@Service
public class SafeBrowsingService {

    private final String apiKey;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public SafeBrowsingService(
            @Value("${GOOGLE_SAFE_BROWSING_API_KEY:}") String apiKey,
            ObjectMapper objectMapper) {
        this.apiKey = apiKey;
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(5))
                .build();
    }

    /**
     * Queries Google Safe Browsing API to check if a URL is categorized as malicious.
     *
     * @param targetUrl The URL to verify
     * @return true if no threats are found, false if flagged as unsafe
     */
    public boolean isUrlSafe(String targetUrl) {
        if (targetUrl == null || targetUrl.isBlank()) {
            return true;
        }

        if (apiKey == null || apiKey.isBlank()) {
            log.warn("Safe Browsing API Key not configured. Bypassing URL safety check for: {}", targetUrl);
            return true;
        }

        try {
            String requestUri = "https://safebrowsing.googleapis.com/v4/threatMatches:find?key=" + apiKey;

            // Construct Standard Safe Browsing v4 Payload Structure
            Map<String, Object> payload = Map.of(
                    "client", Map.of(
                            "clientId", "kedevs-platform",
                            "clientVersion", "1.0.0"
                    ),
                    "threatInfo", Map.of(
                            "threatTypes", List.of("MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"),
                            "platformTypes", List.of("ANY_PLATFORM"),
                            "threatEntryTypes", List.of("URL"),
                            "threatEntries", List.of(Map.of("url", targetUrl))
                    )
            );

            String jsonBody = objectMapper.writeValueAsString(payload);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(requestUri))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                    .timeout(Duration.ofSeconds(10))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                log.error("Safe Browsing API returned non-OK status code: {}. Body: {}", response.statusCode(), response.body());
                // Return true on network/config failure to avoid completely blocking user workflows
                return true;
            }

            Map<?, ?> responseData = objectMapper.readValue(response.body(), Map.class);
            // Standard v4 API returns empty object {} when no threats exist.
            // A "matches" list exists only when the URL is flagged.
            if (responseData != null && responseData.containsKey("threatMatches")) {
                log.warn("URL '{}' was FLAGGED AS UNSAFE by Safe Browsing API.", targetUrl);
                return false;
            }

            return true;

        } catch (Exception e) {
            log.error("Error verifying URL via Safe Browsing API: {}", e.getMessage(), e);
            // Graceful degradation: assume safe if validation fails due to network timeout/errors
            return true;
        }
    }
}
