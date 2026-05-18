package org.moseti.kedevsapi.chat.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.moseti.kedevsapi.chat.dto.ChatDtos.*;
import org.moseti.kedevsapi.chat.service.ChatService;
import org.moseti.kedevsapi.shared.exception.BadRequestException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
@Tag(name = "Chat")
public class ChatController {

    private final ChatService chatService;

    // Thread-safe in-memory rate limiter per user (10 messages per minute)
    private final ConcurrentHashMap<UUID, UserRateLimitState> rateLimiterCache = new ConcurrentHashMap<>();

    private static class UserRateLimitState {
        long lastResetTime = System.currentTimeMillis();
        int tokenCount = 0;
    }

    private void enforceRateLimit(UUID userId) {
        long now = System.currentTimeMillis();
        UserRateLimitState state = rateLimiterCache.computeIfAbsent(userId, k -> new UserRateLimitState());

        synchronized (state) {
            if (now - state.lastResetTime > 60000) {
                state.tokenCount = 0;
                state.lastResetTime = now;
            }
            if (state.tokenCount >= 10) {
                throw new BadRequestException("Rate limit exceeded. Maximum 10 messages per minute.");
            }
            state.tokenCount++;
        }
    }

    private UUID getCurrentUserId() {
        org.springframework.security.core.Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            throw new BadRequestException("Authentication required");
        }
        Object principal = auth.getPrincipal();
        if (principal instanceof UUID) {
            return (UUID) principal;
        }
        if (principal instanceof String) {
            return UUID.fromString((String) principal);
        }
        throw new BadRequestException("Invalid authentication principal");
    }

    @Operation(summary = "Get all active conversations for the authenticated user")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Conversations retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT")
    })
    @GetMapping("/conversations")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<List<ConversationDto>>> getConversations() {
        UUID userId = getCurrentUserId();
        List<ConversationDto> list = chatService.getUserConversations(userId);
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Conversations fetched", list));
    }

    @Operation(summary = "Get paginated message history for a conversation")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Messages retrieved successfully"),
        @ApiResponse(responseCode = "400", description = "User is not a participant"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT"),
        @ApiResponse(responseCode = "404", description = "Conversation not found")
    })
    @GetMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<Page<MessageDto>>> getMessages(
            @PathVariable UUID conversationId,
            @PageableDefault(size = 20) Pageable pageable) {
        UUID userId = getCurrentUserId();
        Page<MessageDto> page = chatService.getConversationMessages(userId, conversationId, pageable);
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Messages fetched", page));
    }

    @Operation(summary = "Send a new message in a conversation")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Message sent successfully"),
        @ApiResponse(responseCode = "400", description = "Rate limit exceeded or not a participant"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT"),
        @ApiResponse(responseCode = "404", description = "Conversation not found")
    })
    @PostMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<MessageDto>> sendMessage(
            @PathVariable UUID conversationId,
            @Valid @RequestBody SendMessageRequest request) {
        UUID userId = getCurrentUserId();
        enforceRateLimit(userId);
        MessageDto msg = chatService.sendMessage(userId, conversationId, request);
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Message sent successfully", msg));
    }

    @Operation(summary = "Accept/Opt-in to start chat conversation")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Conversation accepted successfully"),
        @ApiResponse(responseCode = "400", description = "User is not a participant"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT"),
        @ApiResponse(responseCode = "404", description = "Conversation not found")
    })
    @PostMapping("/conversations/{conversationId}/accept")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<ConversationDto>> acceptConversation(
            @PathVariable UUID conversationId) {
        UUID userId = getCurrentUserId();
        ConversationDto dto = chatService.acceptConversation(userId, conversationId);
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Conversation accepted", dto));
    }
}
