package org.moseti.kedevsapi.spotlight.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.moseti.kedevsapi.shared.enums.SpotlightType;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class SpotlightDtos {

    public record FeaturedProject(
            String title,
            String description,
            String techStack,
            String projectUrl,
            String repoUrl
    ) {}

    public record DeveloperSpotlightCard(
            UUID developerId,
            String developerName,
            String profilePhoto,
            String bio,
            String currentLastRole,
            String locationCity,
            String locationCountry,
            boolean isVerified,
            List<FeaturedProject> featuredProjects
    ) {}

    public record SpotlightSlotResponse(
            UUID id,
            UUID developerId,
            String developerName,
            SpotlightType type,
            LocalDateTime startDate,
            LocalDateTime endDate,
            boolean isActive,
            boolean overriddenByAdmin,
            UUID paymentId,
            LocalDateTime createdAt
    ) {}

    public record CurrentSpotlightResponse(
            DeveloperSpotlightCard daySlot,
            DeveloperSpotlightCard weekSlot
    ) {}

    public record AdminOverrideRequest(
            @NotBlank(message = "Reason is required")
            @Size(max = 500, message = "Reason cannot exceed 500 characters")
            String reason
    ) {}

    public record SlotAvailabilityResponse(
            boolean daySlotAvailable,
            boolean weekSlotAvailable,
            LocalDateTime daySlotExpiresAt,
            LocalDateTime weekSlotExpiresAt
    ) {}
}
