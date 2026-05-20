package org.moseti.kedevsapi.payments.service;

import lombok.extern.slf4j.Slf4j;
import org.moseti.kedevsapi.payments.dto.PaymentDtos;
import org.moseti.kedevsapi.payments.dto.PaymentDtos.StkPushRequestBody;
import org.moseti.kedevsapi.payments.dto.PaymentDtos.StkPushResponse;
import org.moseti.kedevsapi.payments.exception.DarajaApiException;
import org.moseti.kedevsapi.shared.util.Constants;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;

@Service
@Slf4j
public class DarajaService {

    @Value("${daraja.consumer.key}")
    private String consumerKey;

    @Value("${daraja.consumer.secret}")
    private String consumerSecret;

    @Value("${daraja.shortcode}")
    private String shortcode;

    @Value("${daraja.passkey}")
    private String passkey;

    @Value("${daraja.callback.url}")
    private String callbackUrl;

    private final WebClient webClient;

    // Simple in-memory token cache
    private String cachedToken;
    private LocalDateTime tokenExpiresAt;

    public DarajaService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    public String getAccessToken() {
        if (cachedToken != null && tokenExpiresAt != null && tokenExpiresAt.isAfter(LocalDateTime.now())) {
            return cachedToken;
        }

        String credentials = Base64.getEncoder().encodeToString(
                (consumerKey + ":" + consumerSecret).getBytes()
        );

        try {
            PaymentDtos.DarajaTokenResponse response = webClient.get()
                    .uri(Constants.DARAJA_AUTH_URL)
                    .header("Authorization", "Basic " + credentials)
                    .retrieve()
                    .bodyToMono(PaymentDtos.DarajaTokenResponse.class)
                    .block();

            if (response == null || response.accessToken() == null || response.accessToken().isBlank()) {
                throw new DarajaApiException("Failed to retrieve Daraja access token");
            }

            cachedToken = response.accessToken();
            tokenExpiresAt = LocalDateTime.now().plusSeconds(3500);

            log.debug("Daraja access token refreshed (expires in ~58 min)");

            return cachedToken;

        } catch (WebClientResponseException e) {
            log.error("Daraja auth failed: {} {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new DarajaApiException("Failed to authenticate with Daraja API", e);
        }
    }

    public StkPushResponse initiateSTKPush(String phoneNumber, BigDecimal amount,
                                            String accountReference, String description) {
        String formattedPhone = formatPhone(phoneNumber);
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String rawPassword = shortcode + passkey + timestamp;
        String password = Base64.getEncoder().encodeToString(rawPassword.getBytes(StandardCharsets.UTF_8));

        // Truncate accountReference and description per Daraja limits
        String ref = accountReference.length() > 12 ? accountReference.substring(0, 12) : accountReference;
        String desc = description.length() > 13 ? description.substring(0, 13) : description;

        StkPushRequestBody requestBody = new StkPushRequestBody(
                shortcode, password, timestamp,
                "CustomerPayBillOnline",
                amount.setScale(0, RoundingMode.HALF_UP).intValue(),
                formattedPhone, shortcode, formattedPhone,
                callbackUrl, ref, desc
        );

        String token = getAccessToken();

        try {
            StkPushResponse response = webClient.post()
                    .uri(Constants.DARAJA_STK_PUSH_URL)
                    .header("Authorization", "Bearer " + token)
                    .header("Content-Type", "application/json")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(StkPushResponse.class)
                    .block();

            if (response == null) {
                throw new DarajaApiException("Empty response from Daraja STK Push");
            }
            return response;

        } catch (WebClientResponseException e) {
            log.error("Daraja STK push failed: {} {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new DarajaApiException("STK Push failed", e);
        }
    }

    private String formatPhone(String phone) {
        if (phone == null) throw new IllegalArgumentException("Phone number cannot be null");
        phone = phone.trim();
        if (phone.startsWith("+254")) {
            return phone.substring(1);
        } else if (phone.startsWith("0")) {
            return "254" + phone.substring(1);
        } else if (phone.startsWith("254")) {
            return phone;
        }
        throw new IllegalArgumentException("Invalid phone number format: " + phone);
    }
}
