package org.moseti.kedevsapi.notifications.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.moseti.kedevsapi.auth.service.EmailService;
import org.moseti.kedevsapi.notifications.dto.NotificationDtos.*;
import org.moseti.kedevsapi.notifications.entity.Notification;
import org.moseti.kedevsapi.notifications.entity.NotificationPreference;
import org.moseti.kedevsapi.notifications.exception.NotificationNotFoundException;
import org.moseti.kedevsapi.notifications.repository.NotificationPreferenceRepository;
import org.moseti.kedevsapi.notifications.repository.NotificationRepository;
import org.moseti.kedevsapi.shared.enums.NotificationCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private NotificationPreferenceRepository preferenceRepository;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private NotificationService notificationService;

    private UUID userId;
    private NotificationPreference defaultPrefs;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        defaultPrefs = new NotificationPreference();
        defaultPrefs.setUserId(userId);
        
        ReflectionTestUtils.setField(notificationService, "emailService", emailService);
    }

    @Test
    void notify_savesNotificationToDb() {
        notificationService.notify(userId, NotificationCategory.PAYMENT, "Title", "Message", "{}");

        verify(notificationRepository, times(1)).save(any(Notification.class));
    }

    @Test
    void notify_nullUserId_skipsSave() {
        notificationService.notify(null, NotificationCategory.ADMIN, "Title", "Message", null);

        verify(notificationRepository, never()).save(any());
    }

    @Test
    void getOrCreatePreferences_newUser_createsWithDefaults() {
        when(preferenceRepository.findByUserId(userId)).thenReturn(Optional.empty());
        when(preferenceRepository.save(any(NotificationPreference.class))).thenAnswer(i -> i.getArgument(0));

        NotificationPreference prefs = notificationService.getOrCreatePreferences(userId);

        assertNotNull(prefs);
        assertEquals(userId, prefs.getUserId());
        assertTrue(prefs.isEmailOnPaymentReceipt());
        verify(preferenceRepository, times(1)).save(any());
    }

    @Test
    void getOrCreatePreferences_existingUser_returnsExisting() {
        when(preferenceRepository.findByUserId(userId)).thenReturn(Optional.of(defaultPrefs));

        NotificationPreference prefs = notificationService.getOrCreatePreferences(userId);

        assertEquals(defaultPrefs, prefs);
        verify(preferenceRepository, never()).save(any());
    }

    @Test
    void getUnreadCount_returnsCorrectCount() {
        when(notificationRepository.countByUserIdAndIsReadFalse(userId)).thenReturn(5L);

        UnreadCountResponse response = notificationService.getUnreadCount(userId);

        assertEquals(5, response.count());
    }

    @Test
    void markAsRead_success() {
        Notification notification = new Notification();
        notification.setId(UUID.randomUUID());
        notification.setUserId(userId);
        notification.setRead(false);

        when(notificationRepository.findById(notification.getId())).thenReturn(Optional.of(notification));

        notificationService.markAsRead(userId, notification.getId());

        assertTrue(notification.isRead());
        verify(notificationRepository, times(1)).save(notification);
    }

    @Test
    void markAsRead_wrongUser_throwsNotFound() {
        Notification notification = new Notification();
        notification.setId(UUID.randomUUID());
        notification.setUserId(UUID.randomUUID()); // different user

        when(notificationRepository.findById(notification.getId())).thenReturn(Optional.of(notification));

        assertThrows(NotificationNotFoundException.class, () -> 
                notificationService.markAsRead(userId, notification.getId()));
    }

    @Test
    void markAllAsRead_updatesAllUnread() {
        notificationService.markAllAsRead(userId);

        verify(notificationRepository, times(1)).markAllAsRead(userId);
    }

    @Test
    void updatePreferences_partialUpdate_onlyChangesNonNullFields() {
        when(preferenceRepository.findByUserId(userId)).thenReturn(Optional.of(defaultPrefs));
        when(preferenceRepository.save(any(NotificationPreference.class))).thenAnswer(i -> i.getArgument(0));

        UpdatePreferencesRequest request = new UpdatePreferencesRequest(
                false, null, null, null, null, null, null, null, null, null, null, null, null
        );

        NotificationPreferenceResponse response = notificationService.updatePreferences(userId, request);

        assertFalse(response.emailOnPaymentReceipt());
        assertTrue(response.emailOnJobApplication()); // still true (default)
    }

    @Test
    void updatePreferences_allFields_updatesAll() {
        when(preferenceRepository.findByUserId(userId)).thenReturn(Optional.of(defaultPrefs));
        when(preferenceRepository.save(any(NotificationPreference.class))).thenAnswer(i -> i.getArgument(0));

        UpdatePreferencesRequest request = new UpdatePreferencesRequest(
                false, false, false, false, false, false, false, false, false, false, false, false, false
        );

        NotificationPreferenceResponse response = notificationService.updatePreferences(userId, request);

        assertFalse(response.emailOnPaymentReceipt());
        assertFalse(response.emailOnJobApplication());
        assertFalse(response.inAppOnJobApplication());
    }

    @Test
    void getNotifications_returnsPaginatedResults() {
        Notification n = new Notification();
        n.setUserId(userId);
        Page<Notification> page = new PageImpl<>(List.of(n));

        when(notificationRepository.findByUserIdOrderByCreatedAtDesc(eq(userId), any(PageRequest.class)))
                .thenReturn(page);

        Page<NotificationResponse> result = notificationService.getNotifications(userId, PageRequest.of(0, 10));

        assertEquals(1, result.getTotalElements());
    }

    @Test
    void getUnreadNotifications_onlyReturnsUnread() {
        Notification n = new Notification();
        n.setUserId(userId);
        n.setRead(false);
        Page<Notification> page = new PageImpl<>(List.of(n));

        when(notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(eq(userId), any(PageRequest.class)))
                .thenReturn(page);

        Page<NotificationResponse> result = notificationService.getUnreadNotifications(userId, PageRequest.of(0, 10));

        assertEquals(1, result.getTotalElements());
    }

    @Test
    void getPreferences_returnsMappedResponse() {
        when(preferenceRepository.findByUserId(userId)).thenReturn(Optional.of(defaultPrefs));

        NotificationPreferenceResponse response = notificationService.getPreferences(userId);

        assertTrue(response.emailOnPaymentReceipt());
    }
}
