package org.moseti.kedevsapi.contact.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.moseti.kedevsapi.contact.dto.ContactDtos.ContactMessageResponse;
import org.moseti.kedevsapi.contact.dto.ContactDtos.ContactSubmissionRequest;
import org.moseti.kedevsapi.contact.entity.ContactMessage;
import org.moseti.kedevsapi.contact.repository.ContactMessageRepository;
import org.moseti.kedevsapi.shared.dto.ApiResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ContactService {

    private final ContactMessageRepository contactMessageRepository;

    @Transactional
    public ApiResponse<ContactMessageResponse> submitMessage(ContactSubmissionRequest request) {
        log.info("Processing contact message from: {}", request.email());

        ContactMessage message = ContactMessage.builder()
            .name(request.name())
            .email(request.email())
            .subject(request.subject())
            .message(request.message())
            .isRead(false)
            .build();

        ContactMessage saved = contactMessageRepository.save(message);

        // TODO: Integrate with email service to notify support@kedevelopers.com
        
        return ApiResponse.success("Message sent. We'll respond within 1–2 business days.", mapToResponse(saved));
    }

    private ContactMessageResponse mapToResponse(ContactMessage message) {
        return ContactMessageResponse.builder()
            .id(message.getId())
            .name(message.getName())
            .email(message.getEmail())
            .subject(message.getSubject())
            .message(message.getMessage())
            .isRead(message.isRead())
            .createdAt(message.getCreatedAt())
            .build();
    }
}
