package org.moseti.kedevsapi.contact.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.moseti.kedevsapi.auth.service.EmailService;
import org.moseti.kedevsapi.contact.dto.ContactDtos.ContactMessageResponse;
import org.moseti.kedevsapi.contact.dto.ContactDtos.ContactSubmissionRequest;
import org.moseti.kedevsapi.contact.entity.ContactMessage;
import org.moseti.kedevsapi.contact.repository.ContactMessageRepository;
import org.moseti.kedevsapi.shared.dto.ApiResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ContactService {

    private final ContactMessageRepository contactMessageRepository;
    private final EmailService emailService;

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

        return ApiResponse.success("Message sent. We'll respond within 1–2 business days.", mapToResponse(saved));
    }

    @Transactional(readOnly = true)
    public ApiResponse<Page<ContactMessageResponse>> getAllMessages(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ContactMessage> messages = contactMessageRepository.findAll(pageable);
        return ApiResponse.success("Messages retrieved successfully", messages.map(this::mapToResponse));
    }

    @Transactional
    public ApiResponse<ContactMessageResponse> markAsRead(UUID id) {
        ContactMessage message = contactMessageRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Support message not found"));
        message.setRead(true);
        ContactMessage saved = contactMessageRepository.save(message);
        log.info("Support message {} marked as read", id);
        return ApiResponse.success("Message marked as read", mapToResponse(saved));
    }

    @Transactional
    public ApiResponse<ContactMessageResponse> replyToMessage(UUID id, String replyMessage) {
        ContactMessage message = contactMessageRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Support message not found"));

        message.setAdminReply(replyMessage);
        message.setRepliedAt(LocalDateTime.now());
        message.setRead(true);
        ContactMessage saved = contactMessageRepository.save(message);

        // Send reply email asynchronously
        emailService.sendSupportReply(
            message.getEmail(),
            message.getName(),
            message.getSubject(),
            message.getMessage(),
            replyMessage
        );

        log.info("Support reply sent for message {} to {}", id, message.getEmail());
        return ApiResponse.success("Reply sent successfully", mapToResponse(saved));
    }

    private ContactMessageResponse mapToResponse(ContactMessage message) {
        return ContactMessageResponse.builder()
            .id(message.getId())
            .name(message.getName())
            .email(message.getEmail())
            .subject(message.getSubject())
            .message(message.getMessage())
            .isRead(message.isRead())
            .adminReply(message.getAdminReply())
            .repliedAt(message.getRepliedAt())
            .createdAt(message.getCreatedAt())
            .build();
    }
}
