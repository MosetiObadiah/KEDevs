package org.moseti.kedevsapi.chat.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.moseti.kedevsapi.chat.dto.ChatDtos.*;
import org.moseti.kedevsapi.chat.entity.Conversation;
import org.moseti.kedevsapi.chat.entity.Message;
import org.moseti.kedevsapi.chat.repository.ConversationRepository;
import org.moseti.kedevsapi.chat.repository.MessageRepository;
import org.moseti.kedevsapi.shared.exception.BadRequestException;
import org.moseti.kedevsapi.shared.exception.ResourceNotFoundException;
import org.moseti.kedevsapi.shared.dto.WebSocketEvent;
import org.moseti.kedevsapi.users.entity.ContactRequest;
import org.moseti.kedevsapi.users.entity.DeveloperProfile;
import org.moseti.kedevsapi.users.entity.EmployerProfile;
import org.moseti.kedevsapi.users.entity.User;
import org.moseti.kedevsapi.users.repository.DeveloperProfileRepository;
import org.moseti.kedevsapi.users.repository.EmployerProfileRepository;
import org.moseti.kedevsapi.users.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final EmployerProfileRepository employerProfileRepository;
    private final DeveloperProfileRepository developerProfileRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public void createConversationForAcceptedRequest(ContactRequest request) {
        if (request == null) {
            return;
        }
        Optional<Conversation> existing = conversationRepository.findByContactRequestId(request.getId());
        if (existing.isPresent()) {
            log.info("Conversation already exists for accepted contact request: {}", request.getId());
            return;
        }

        Conversation conv = new Conversation();
        conv.setContactRequest(request);
        conv.setDeveloperAccepted(true);
        conv.setEmployerAccepted(true);
        Conversation savedConv = conversationRepository.save(conv);
        log.info("Conversation created successfully for accepted contact request: {}", request.getId());

        // Notify both via WebSocket that the chat is active!
        Conversation convForDto = savedConv != null ? savedConv : conv;
        ConversationDto devDto = convertToDto(convForDto, request.getDeveloperProfile().getUserId());
        ConversationDto senderDto = convertToDto(convForDto, request.getSenderUserId());
        
        messagingTemplate.convertAndSendToUser(
                request.getDeveloperProfile().getUserId().toString(),
                "/queue/chats",
                new WebSocketEvent<>("CHAT_ACTIVATED", devDto)
        );
        messagingTemplate.convertAndSendToUser(
                request.getSenderUserId().toString(),
                "/queue/chats",
                new WebSocketEvent<>("CHAT_ACTIVATED", senderDto)
        );
    }

    @Transactional(readOnly = true)
    public List<ConversationDto> getUserConversations(UUID userId) {
        List<Conversation> conversations = conversationRepository.findAllByUserIdOrderByUpdatedAtDesc(userId);
        return conversations.stream()
                .filter(c -> {
                    ContactRequest cr = c.getContactRequest();
                    boolean isDev = cr.getDeveloperProfile().getUserId().equals(userId);
                    if (isDev) {
                        return !c.isDeletedByDeveloper();
                    } else {
                        return !c.isDeletedByEmployer();
                    }
                })
                .map(c -> convertToDto(c, userId))
                .collect(Collectors.toList());
    }

    @Transactional
    public Page<MessageDto> getConversationMessages(UUID userId, UUID conversationId, Pageable pageable) {
        Conversation conv = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));

        ContactRequest cr = conv.getContactRequest();
        UUID devUserId = cr.getDeveloperProfile().getUserId();
        UUID senderUserId = cr.getSenderUserId();

        if (!userId.equals(devUserId) && !userId.equals(senderUserId)) {
            throw new BadRequestException("You are not a participant in this conversation");
        }

        // Reset unread count for the fetching user
        boolean isDeveloper = userId.equals(devUserId);
        if (isDeveloper && conv.getDeveloperUnreadCount() > 0) {
            conv.setDeveloperUnreadCount(0);
            conversationRepository.save(conv);
        } else if (!isDeveloper && conv.getEmployerUnreadCount() > 0) {
            conv.setEmployerUnreadCount(0);
            conversationRepository.save(conv);
        }

        return messageRepository.findByConversationId(conversationId, pageable)
                .map(m -> new MessageDto(
                        m.getId(),
                        conversationId,
                        m.getSender().getId(),
                        m.getSender().getFullName(),
                        m.getContent(),
                        m.getCreatedAt()
                ));
    }

    @Transactional
    public MessageDto sendMessage(UUID senderId, UUID conversationId, SendMessageRequest req) {
        Conversation conv = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));

        ContactRequest cr = conv.getContactRequest();
        UUID devUserId = cr.getDeveloperProfile().getUserId();
        UUID senderUserId = cr.getSenderUserId();

        if (!senderId.equals(devUserId) && !senderId.equals(senderUserId)) {
            throw new BadRequestException("You are not a participant in this conversation");
        }

        if (conv.isBlockedByDeveloper() || conv.isBlockedByEmployer()) {
            throw new BadRequestException("This conversation is blocked");
        }

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new ResourceNotFoundException("Sender not found"));

        // Create and save message
        Message msg = new Message();
        msg.setConversation(conv);
        msg.setSender(sender);
        msg.setContent(req.content());
        msg = messageRepository.save(msg);

        // Update conversation dynamic fields (O(1) fast fetch)
        conv.setLastMessageContent(req.content());
        conv.setLastMessageAt(msg.getCreatedAt());
        conv.setDeletedByDeveloper(false);
        conv.setDeletedByEmployer(false);

        // Increment unread count for the other participant
        if (senderId.equals(devUserId)) {
            conv.setEmployerUnreadCount(conv.getEmployerUnreadCount() + 1);
        } else {
            conv.setDeveloperUnreadCount(conv.getDeveloperUnreadCount() + 1);
        }
        conversationRepository.save(conv);

        MessageDto dto = new MessageDto(
                msg.getId(),
                conversationId,
                senderId,
                sender.getFullName(),
                msg.getContent(),
                msg.getCreatedAt()
        );

        // Broadcast to both developers and employers
        messagingTemplate.convertAndSendToUser(
                devUserId.toString(),
                "/queue/chats",
                new WebSocketEvent<>("NEW_CHAT_MESSAGE", dto)
        );

        messagingTemplate.convertAndSendToUser(
                senderUserId.toString(),
                "/queue/chats",
                new WebSocketEvent<>("NEW_CHAT_MESSAGE", dto)
        );

        return dto;
    }

    private ConversationDto convertToDto(Conversation conv, UUID currentUserId) {
        ContactRequest cr = conv.getContactRequest();
        boolean isCurrentDeveloper = cr.getDeveloperProfile().getUserId().equals(currentUserId);

        String otherName;
        String otherAvatar = null;
        int unreadCount = isCurrentDeveloper ? conv.getDeveloperUnreadCount() : conv.getEmployerUnreadCount();

        if (isCurrentDeveloper) {
            // Other is the sender
            otherName = cr.getSenderUser().getFullName();
            if (cr.getSenderUser().getRole() == org.moseti.kedevsapi.shared.enums.Role.EMPLOYER) {
                Optional<EmployerProfile> emp = employerProfileRepository.findByUserId(cr.getSenderUserId());
                if (emp.isPresent()) {
                    otherName = emp.get().getCompanyName();
                    otherAvatar = emp.get().getLogoUrl();
                }
            } else {
                Optional<DeveloperProfile> dev = developerProfileRepository.findByUserId(cr.getSenderUserId());
                if (dev.isPresent()) {
                    otherName = dev.get().getFirstName() + " " + dev.get().getLastName();
                    otherAvatar = dev.get().getProfilePhoto();
                }
            }
        } else {
            // Other is the developer
            otherName = cr.getDeveloperProfile().getFirstName() + " " + cr.getDeveloperProfile().getLastName();
            otherAvatar = cr.getDeveloperProfile().getProfilePhoto();
        }

        return new ConversationDto(
                conv.getId(),
                cr.getId(),
                otherName,
                otherAvatar,
                conv.getLastMessageContent(),
                conv.getLastMessageAt(),
                unreadCount,
                conv.isDeveloperAccepted(),
                conv.isEmployerAccepted(),
                conv.isBlockedByDeveloper(),
                conv.isBlockedByEmployer(),
                conv.isDeletedByDeveloper(),
                conv.isDeletedByEmployer()
        );
    }

    @Transactional
    public ConversationDto acceptConversation(UUID userId, UUID conversationId) {
        Conversation conv = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));

        ContactRequest cr = conv.getContactRequest();
        UUID devUserId = cr.getDeveloperProfile().getUserId();
        UUID senderUserId = cr.getSenderUserId();

        if (!userId.equals(devUserId) && !userId.equals(senderUserId)) {
            throw new BadRequestException("You are not a participant in this conversation");
        }

        if (userId.equals(devUserId)) {
            conv.setDeveloperAccepted(true);
        } else {
            conv.setEmployerAccepted(true);
        }
        
        conv = conversationRepository.save(conv);
        ConversationDto dto = convertToDto(conv, userId);

        // If both have accepted, notify both via WebSocket that the chat is active!
        if (conv.isDeveloperAccepted() && conv.isEmployerAccepted()) {
            messagingTemplate.convertAndSendToUser(
                    devUserId.toString(),
                    "/queue/chats",
                    new WebSocketEvent<>("CHAT_ACTIVATED", dto)
            );
            messagingTemplate.convertAndSendToUser(
                    senderUserId.toString(),
                    "/queue/chats",
                    new WebSocketEvent<>("CHAT_ACTIVATED", dto)
            );
        }

        return dto;
    }

    @Transactional
    public ConversationDto toggleBlockConversation(UUID userId, UUID conversationId) {
        Conversation conv = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));

        ContactRequest cr = conv.getContactRequest();
        UUID devUserId = cr.getDeveloperProfile().getUserId();
        UUID senderUserId = cr.getSenderUserId();

        if (!userId.equals(devUserId) && !userId.equals(senderUserId)) {
            throw new BadRequestException("You are not a participant in this conversation");
        }

        if (userId.equals(devUserId)) {
            conv.setBlockedByDeveloper(!conv.isBlockedByDeveloper());
        } else {
            conv.setBlockedByEmployer(!conv.isBlockedByEmployer());
        }
        conv = conversationRepository.save(conv);
        return convertToDto(conv, userId);
    }

    @Transactional
    public void deleteConversation(UUID userId, UUID conversationId) {
        Conversation conv = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));

        ContactRequest cr = conv.getContactRequest();
        UUID devUserId = cr.getDeveloperProfile().getUserId();
        UUID senderUserId = cr.getSenderUserId();

        if (!userId.equals(devUserId) && !userId.equals(senderUserId)) {
            throw new BadRequestException("You are not a participant in this conversation");
        }

        if (userId.equals(devUserId)) {
            conv.setDeletedByDeveloper(true);
        } else {
            conv.setDeletedByEmployer(true);
        }
        conversationRepository.save(conv);
    }
}
