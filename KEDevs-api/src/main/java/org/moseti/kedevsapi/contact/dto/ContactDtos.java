package org.moseti.kedevsapi.contact.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.UUID;

public class ContactDtos {

    @Builder
    public record ContactSubmissionRequest(
        @NotBlank(message = "Name is required")
        String name,

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        String email,

        @NotBlank(message = "Subject is required")
        String subject,

        @NotBlank(message = "Message is required")
        String message
    ) {}

    @Builder
    public record ContactMessageResponse(
        UUID id,
        String name,
        String email,
        String subject,
        String message,
        boolean isRead,
        LocalDateTime createdAt
    ) {}
}
