package org.moseti.kedevsapi.jobs.dto;

import jakarta.validation.constraints.NotBlank;
import org.moseti.kedevsapi.shared.enums.PaymentType;

import java.time.LocalDateTime;
import java.util.UUID;

public class PinnedJobSlotDtos {

    public record PinnedJobSlotResponse(
            UUID id,
            UUID jobId,
            String jobTitle,
            UUID employerId,
            String employerName,
            PaymentType durationType,
            LocalDateTime startDate,
            LocalDateTime endDate,
            boolean isActive,
            boolean overriddenByAdmin,
            UUID paymentId,
            LocalDateTime createdAt
    ) {}

    public record PastPinnedJobSlotResponse(
            UUID id,
            UUID jobId,
            String jobTitle,
            UUID employerId,
            String employerName,
            PaymentType durationType,
            LocalDateTime startDate,
            LocalDateTime endDate
    ) {}

    public record AdminOverrideJobSlotRequest(
            @NotBlank(message = "Reason for override is required")
            String reason
    ) {}
}
