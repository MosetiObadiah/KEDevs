package org.moseti.kedevsapi.chat.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.UUID;

public class ChatDtos {

    public record ConversationDto(
        UUID id,
        UUID contactRequestId,
        String otherUserName,
        String otherUserAvatar,
        String lastMessage,
        LocalDateTime lastMessageAt,
        int unreadCount,
        boolean developerAccepted,
        boolean employerAccepted,
        boolean blockedByDeveloper,
        boolean blockedByEmployer,
        boolean deletedByDeveloper,
        boolean deletedByEmployer
    ) {}

    public record MessageDto(
        UUID id,
        UUID conversationId,
        UUID senderId,
        String senderName,
        String content,
        LocalDateTime createdAt
    ) {}

    public record SendMessageRequest(
        @NotBlank(message = "Message content cannot be blank")
        @Size(max = 2000, message = "Message content cannot exceed 2000 characters")
        String content
    ) {}
}
