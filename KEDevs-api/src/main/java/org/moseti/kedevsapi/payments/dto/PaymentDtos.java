package org.moseti.kedevsapi.payments.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import org.moseti.kedevsapi.shared.enums.PaymentStatus;
import org.moseti.kedevsapi.shared.enums.PaymentType;
import org.moseti.kedevsapi.shared.enums.SpotlightType;
import org.moseti.kedevsapi.shared.enums.SubscriptionStatus;
import org.moseti.kedevsapi.shared.enums.SubscriptionType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public class PaymentDtos {

    public record InitiatePaymentRequest(
            @NotBlank(message = "Phone number is required")
            @Pattern(regexp = "^(\\+?254|0)[17]\\d{8}$", message = "Invalid Kenyan phone number format")
            @Schema(description = "M-Pesa phone number", example = "254712345678")
            String phoneNumber
    ) {}

    public record InitiateSpotlightRequest(
            @NotBlank(message = "Phone number is required")
            @Pattern(regexp = "^(\\+?254|0)[17]\\d{8}$", message = "Invalid Kenyan phone number format")
            @Schema(description = "M-Pesa phone number", example = "254712345678")
            String phoneNumber,
            @NotNull(message = "Spotlight type is required")
            @Schema(description = "Type of spotlight", allowableValues = {"DAY", "WEEK"}, example = "DAY")
            SpotlightType spotlightType
    ) {}

    public record PaymentInitiationResponse(
            String checkoutRequestId,
            String message,
            BigDecimal amount
    ) {}

    public record PaymentResponse(
            UUID id,
            PaymentType type,
            BigDecimal amount,
            String currency,
            PaymentStatus status,
            String mpesaReceiptNo,
            String phoneNumber,
            LocalDateTime paidAt,
            LocalDateTime createdAt
    ) {}

    public record SubscriptionStatusResponse(
            boolean hasAnnualMembership,
            LocalDateTime membershipExpiresAt,
            boolean isProAccount,
            LocalDateTime proExpiresAt,
            int searchTokensRemaining
    ) {}

    public record PlatformSettingResponse(
            String settingKey,
            String settingValue,
            String description
    ) {}

    // Daraja STK Push response
    public record StkPushResponse(
            @JsonProperty("MerchantRequestID") String merchantRequestId,
            @JsonProperty("CheckoutRequestID") String checkoutRequestId,
            @JsonProperty("ResponseCode") String responseCode,
            @JsonProperty("ResponseDescription") String responseDescription,
            @JsonProperty("CustomerMessage") String customerMessage
    ) {}

    // Daraja callback request structure
    public record DarajaCallbackRequest(
            @JsonProperty("Body") CallbackBody body
    ) {
        public record CallbackBody(
                @JsonProperty("stkCallback") StkCallback stkCallback
        ) {}

        public record StkCallback(
                @JsonProperty("MerchantRequestID") String merchantRequestId,
                @JsonProperty("CheckoutRequestID") String checkoutRequestId,
                @JsonProperty("ResultCode") int resultCode,
                @JsonProperty("ResultDesc") String resultDesc,
                @JsonProperty("CallbackMetadata") CallbackMetadata callbackMetadata
        ) {}

        public record CallbackMetadata(
                @JsonProperty("Item") java.util.List<CallbackItem> item
        ) {}

        public record CallbackItem(
                @JsonProperty("Name") String name,
                @JsonProperty("Value") Object value
        ) {}
    }

    // Internal STK request body for Daraja API
    public record StkPushRequestBody(
            @JsonProperty("BusinessShortCode") String businessShortCode,
            @JsonProperty("Password") String password,
            @JsonProperty("Timestamp") String timestamp,
            @JsonProperty("TransactionType") String transactionType,
            @JsonProperty("Amount") int amount,
            @JsonProperty("PartyA") String partyA,
            @JsonProperty("PartyB") String partyB,
            @JsonProperty("PhoneNumber") String phoneNumber,
            @JsonProperty("CallBackURL") String callBackURL,
            @JsonProperty("AccountReference") String accountReference,
            @JsonProperty("TransactionDesc") String transactionDesc
    ) {}

    // Daraja access token response
    public record DarajaTokenResponse(
            @JsonProperty("access_token") String accessToken,
            @JsonProperty("expires_in") String expiresIn
    ) {}
}
