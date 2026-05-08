package org.moseti.kedevsapi.users.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import org.moseti.kedevsapi.shared.enums.VerificationStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public class VerificationDtos {

    public record VerificationStatusResponse(
            VerificationStatus status,
            Map<String, Boolean> profileCompleteness,
            boolean isEligible,
            UUID requestId,
            String rejectionReason,
            LocalDateTime createdAt
    ) {}

    public record InitiateVerificationResponse(
            UUID requestId,
            String checkoutRequestId,
            String customerMessage
    ) {}
}
