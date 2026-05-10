package org.moseti.kedevsapi.contact.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.moseti.kedevsapi.contact.dto.ContactDtos.ContactMessageResponse;
import org.moseti.kedevsapi.contact.dto.ContactDtos.ContactSubmissionRequest;
import org.moseti.kedevsapi.contact.service.ContactService;
import org.moseti.kedevsapi.shared.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
