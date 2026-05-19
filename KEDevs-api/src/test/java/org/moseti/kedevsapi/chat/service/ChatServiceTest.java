package org.moseti.kedevsapi.chat.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.moseti.kedevsapi.chat.dto.ChatDtos.*;
import org.moseti.kedevsapi.chat.entity.Conversation;
import org.moseti.kedevsapi.chat.entity.Message;
import org.moseti.kedevsapi.chat.repository.ConversationRepository;
import org.moseti.kedevsapi.chat.repository.MessageRepository;
import org.moseti.kedevsapi.users.entity.ContactRequest;
import org.moseti.kedevsapi.users.entity.DeveloperProfile;
import org.moseti.kedevsapi.users.entity.User;
import org.moseti.kedevsapi.users.repository.DeveloperProfileRepository;
import org.moseti.kedevsapi.users.repository.EmployerProfileRepository;
import org.moseti.kedevsapi.users.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.moseti.kedevsapi.shared.exception.BadRequestException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ChatServiceTest {

    @Mock
    private ConversationRepository conversationRepository;

    @Mock
    private MessageRepository messageRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private EmployerProfileRepository employerProfileRepository;

    @Mock
    private DeveloperProfileRepository developerProfileRepository;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private ChatService chatService;

    private ContactRequest mockRequest;
    private DeveloperProfile mockDevProfile;
    private User mockSender;
    private Conversation mockConversation;

    @BeforeEach
    void setUp() {
        UUID requestId = UUID.randomUUID();
        UUID devUserId = UUID.randomUUID();
        UUID senderUserId = UUID.randomUUID();

        mockDevProfile = new DeveloperProfile();
        mockDevProfile.setId(UUID.randomUUID());
        mockDevProfile.setUserId(devUserId);
        mockDevProfile.setFirstName("Kenya");
        mockDevProfile.setLastName("Dev");

        mockSender = new User();
        mockSender.setId(senderUserId);
        mockSender.setFullName("Employer One");

        mockRequest = new ContactRequest();
        mockRequest.setId(requestId);
        mockRequest.setDeveloperProfile(mockDevProfile);
        mockRequest.setSenderUserId(senderUserId);
        mockRequest.setSenderUser(mockSender);

        mockConversation = new Conversation();
        mockConversation.setId(UUID.randomUUID());
        mockConversation.setContactRequest(mockRequest);
    }

    @Test
    void createConversationForAcceptedRequest_createsIfNew() {
        when(conversationRepository.findByContactRequestId(mockRequest.getId())).thenReturn(Optional.empty());

        chatService.createConversationForAcceptedRequest(mockRequest);

        verify(conversationRepository, times(1)).save(any(Conversation.class));
    }

    @Test
    void createConversationForAcceptedRequest_idempotentIfExisting() {
        when(conversationRepository.findByContactRequestId(mockRequest.getId())).thenReturn(Optional.of(mockConversation));

        chatService.createConversationForAcceptedRequest(mockRequest);

        verify(conversationRepository, never()).save(any(Conversation.class));
    }

    @Test
    void sendMessage_success() {
        SendMessageRequest request = new SendMessageRequest("Hello Kenya");

        when(conversationRepository.findById(mockConversation.getId())).thenReturn(Optional.of(mockConversation));
        when(userRepository.findById(mockSender.getId())).thenReturn(Optional.of(mockSender));
        when(messageRepository.save(any(Message.class))).thenAnswer(invocation -> {
            Message msg = invocation.getArgument(0);
            msg.setId(UUID.randomUUID());
            return msg;
        });

        MessageDto dto = chatService.sendMessage(mockSender.getId(), mockConversation.getId(), request);

        assertNotNull(dto);
        assertEquals("Hello Kenya", dto.content());
        assertEquals(mockSender.getId(), dto.senderId());
        assertEquals("Hello Kenya", mockConversation.getLastMessageContent());
        assertEquals(1, mockConversation.getDeveloperUnreadCount()); // Sender is Employer, Developer is notified
        verify(messagingTemplate, times(2)).convertAndSendToUser(anyString(), anyString(), any());
    }

    @Test
    void getConversationMessages_resetsUnreadCounter() {
        mockConversation.setDeveloperUnreadCount(5);
        Page<Message> messagePage = new PageImpl<>(List.of());

        when(conversationRepository.findById(mockConversation.getId())).thenReturn(Optional.of(mockConversation));
        when(messageRepository.findByConversationId(eq(mockConversation.getId()), any(PageRequest.class)))
                .thenReturn(messagePage);

        // Fetching as Developer (devUserId matches)
        Page<MessageDto> page = chatService.getConversationMessages(
                mockDevProfile.getUserId(),
                mockConversation.getId(),
                PageRequest.of(0, 20)
        );

        assertNotNull(page);
        assertEquals(0, mockConversation.getDeveloperUnreadCount());
        verify(conversationRepository, times(1)).save(mockConversation);
    }

    @Test
    void acceptConversation_updatesStatusAndBroadcasts() {
        UUID devUserId = mockDevProfile.getUserId();
        mockConversation.setDeveloperAccepted(false);
        mockConversation.setEmployerAccepted(false);

        when(conversationRepository.findById(mockConversation.getId())).thenReturn(Optional.of(mockConversation));
        when(conversationRepository.save(any(Conversation.class))).thenAnswer(inv -> inv.getArgument(0));

        // Accept as developer
        ConversationDto dto = chatService.acceptConversation(devUserId, mockConversation.getId());

        assertNotNull(dto);
        assertTrue(dto.developerAccepted());
        assertFalse(dto.employerAccepted());

        // Now accept as employer
        UUID senderUserId = mockRequest.getSenderUserId();
        dto = chatService.acceptConversation(senderUserId, mockConversation.getId());

        assertTrue(dto.developerAccepted());
        assertTrue(dto.employerAccepted());

        // Verify WebSocket broadcast is sent to both users when both accepted
        verify(messagingTemplate, times(2)).convertAndSendToUser(anyString(), eq("/queue/chats"), any());
    }

    @Test
    void toggleBlockConversation_togglesCorrectly() {
        UUID devUserId = mockDevProfile.getUserId();
        mockConversation.setBlockedByDeveloper(false);

        when(conversationRepository.findById(mockConversation.getId())).thenReturn(Optional.of(mockConversation));
        when(conversationRepository.save(any(Conversation.class))).thenAnswer(inv -> inv.getArgument(0));

        ConversationDto dto = chatService.toggleBlockConversation(devUserId, mockConversation.getId());
        assertTrue(dto.blockedByDeveloper());

        dto = chatService.toggleBlockConversation(devUserId, mockConversation.getId());
        assertFalse(dto.blockedByDeveloper());
    }

    @Test
    void deleteConversation_marksSoftDeleted() {
        UUID devUserId = mockDevProfile.getUserId();
        mockConversation.setDeletedByDeveloper(false);

        when(conversationRepository.findById(mockConversation.getId())).thenReturn(Optional.of(mockConversation));
        when(conversationRepository.save(any(Conversation.class))).thenAnswer(inv -> inv.getArgument(0));

        chatService.deleteConversation(devUserId, mockConversation.getId());
        assertTrue(mockConversation.isDeletedByDeveloper());
    }

    @Test
    void sendMessage_throwsExceptionIfBlocked() {
        SendMessageRequest request = new SendMessageRequest("Hello Kenya");
        mockConversation.setBlockedByDeveloper(true);

        when(conversationRepository.findById(mockConversation.getId())).thenReturn(Optional.of(mockConversation));

        assertThrows(BadRequestException.class, () -> {
            chatService.sendMessage(mockSender.getId(), mockConversation.getId(), request);
        });
    }

    @Test
    void getUserConversations_excludesDeletedConversations() {
        UUID devUserId = mockDevProfile.getUserId();
        mockConversation.setDeletedByDeveloper(true);

        when(conversationRepository.findAllByUserIdOrderByUpdatedAtDesc(devUserId)).thenReturn(List.of(mockConversation));

        List<ConversationDto> list = chatService.getUserConversations(devUserId);
        assertTrue(list.isEmpty());
    }
}
