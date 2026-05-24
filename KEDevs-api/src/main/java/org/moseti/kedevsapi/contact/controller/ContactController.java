package org.moseti.kedevsapi.contact.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.moseti.kedevsapi.contact.dto.ContactDtos.ContactMessageResponse;
import org.moseti.kedevsapi.contact.dto.ContactDtos.ContactSubmissionRequest;
import org.moseti.kedevsapi.contact.dto.ContactDtos.SupportReplyRequest;
import org.moseti.kedevsapi.contact.service.ContactService;
import org.moseti.kedevsapi.shared.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.data.domain.Page;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/contact")
@RequiredArgsConstructor
@Tag(name = "Contact", description = "Public contact endpoints")
public class ContactController {

    private final ContactService contactService;

    @PostMapping
    @Operation(summary = "Submit a contact inquiry")
    public ResponseEntity<ApiResponse<ContactMessageResponse>> submitInquiry(
            @Valid @RequestBody ContactSubmissionRequest request) {
        return ResponseEntity.ok(contactService.submitMessage(request));
    }

    @GetMapping("/messages")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all contact messages (Admin only)")
    public ResponseEntity<ApiResponse<Page<ContactMessageResponse>>> getAllMessages(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(contactService.getAllMessages(page, size));
    }

    @PatchMapping("/messages/{id}/read")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Mark a support message as read (Admin only)")
    public ResponseEntity<ApiResponse<ContactMessageResponse>> markAsRead(@PathVariable UUID id) {
        return ResponseEntity.ok(contactService.markAsRead(id));
    }

    @PostMapping("/messages/{id}/reply")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Send a reply to a support message (Admin only)")
    public ResponseEntity<ApiResponse<ContactMessageResponse>> replyToMessage(
            @PathVariable UUID id,
            @Valid @RequestBody SupportReplyRequest request) {
        return ResponseEntity.ok(contactService.replyToMessage(id, request.replyMessage()));
    }
}
