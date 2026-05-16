package org.moseti.kedevsapi.users.service;

import tools.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.moseti.kedevsapi.shared.enums.AvailabilityStatus;
import org.moseti.kedevsapi.shared.enums.ContactRequestStatus;
import org.moseti.kedevsapi.shared.exception.BadRequestException;
import org.moseti.kedevsapi.users.dto.UserDtos;
import org.moseti.kedevsapi.users.entity.*;
import org.moseti.kedevsapi.users.repository.*;
import org.moseti.kedevsapi.users.exception.*;
import org.moseti.kedevsapi.notifications.service.NotificationService;
import org.moseti.kedevsapi.shared.service.FileUploadService;
import org.moseti.kedevsapi.payments.repository.UserFlagRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmployerProfileServiceTest {

    @Mock private EmployerProfileRepository employerProfileRepository;
    @Mock private DeveloperProfileRepository developerProfileRepository;
    @Mock private ContactRequestRepository contactRequestRepository;
    @Mock private ObjectMapper objectMapper;
    @Mock private UserRepository userRepository;
    @Mock private NotificationService notificationService;
    @Mock private org.moseti.kedevsapi.shared.service.SettingService settingService;
    @Mock private FileUploadService fileUploadService;
    @Mock private UserFlagRepository userFlagRepository;

    @InjectMocks
    private EmployerProfileService employerProfileService;

    private UUID userId;
    private UUID employerProfileId;
    private UUID developerProfileId;
    private User testUser;
    private EmployerProfile testEmployerProfile;
    private DeveloperProfile testDeveloperProfile;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        employerProfileId = UUID.randomUUID();
        developerProfileId = UUID.randomUUID();

        testUser = new User();
        testUser.setId(userId);
        testUser.setFullName("Alice Smith");
        testUser.setRole(org.moseti.kedevsapi.shared.enums.Role.EMPLOYER);

        testEmployerProfile = new EmployerProfile();
        testEmployerProfile.setId(employerProfileId);
        testEmployerProfile.setUserId(userId);
        testEmployerProfile.setCompanyName("Acme Corp");
        testEmployerProfile.setContactPersonName("Alice Smith");
        testEmployerProfile.setApproved(false);

        testDeveloperProfile = new DeveloperProfile();
        testDeveloperProfile.setId(developerProfileId);
        testDeveloperProfile.setUserId(UUID.randomUUID());
        testDeveloperProfile.setFirstName("Bob");
        testDeveloperProfile.setLastName("Builder");
        testDeveloperProfile.setAvailabilityStatus(AvailabilityStatus.OPEN_TO_OFFERS);
    }

    @Test
    void createProfile_Success() {
        when(employerProfileRepository.existsByUserId(userId)).thenReturn(false);
        when(employerProfileRepository.save(any(EmployerProfile.class))).thenReturn(testEmployerProfile);

        UserDtos.CreateEmployerProfileRequest request = new UserDtos.CreateEmployerProfileRequest(
                "Alice Smith", "Acme Corp", null, "Tech", null, "Nairobi", null, null, null, null, null);

        UserDtos.EmployerProfileResponse response = employerProfileService.createProfile(userId, request);

        assertNotNull(response);
        assertEquals("Acme Corp", response.companyName());
        verify(employerProfileRepository).save(any(EmployerProfile.class));
    }

    @Test
    void createProfile_Duplicate_ThrowsProfileAlreadyExistsException() {
        when(employerProfileRepository.existsByUserId(userId)).thenReturn(true);

        UserDtos.CreateEmployerProfileRequest request = new UserDtos.CreateEmployerProfileRequest(
                "Alice", "Acme", null, null, null, null, null, null, null, null, null);

        assertThrows(ProfileAlreadyExistsException.class,
                () -> employerProfileService.createProfile(userId, request));
        verify(employerProfileRepository, never()).save(any());
    }

    @Test
    void updateProfile_Success() {
        when(employerProfileRepository.findByUserId(userId)).thenReturn(Optional.of(testEmployerProfile));
        when(employerProfileRepository.save(any(EmployerProfile.class))).thenReturn(testEmployerProfile);

        UserDtos.UpdateEmployerProfileRequest request = new UserDtos.UpdateEmployerProfileRequest(
                null, "New Corp", null, null, null, null, null, null, null, null, null);

        UserDtos.EmployerProfileResponse response = employerProfileService.updateProfile(userId, request);

        assertNotNull(response);
        verify(employerProfileRepository).save(testEmployerProfile);
    }


    @Test
    void sendContactRequest_Success() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(employerProfileRepository.findByUserId(userId)).thenReturn(Optional.of(testEmployerProfile));
        when(developerProfileRepository.findById(developerProfileId)).thenReturn(Optional.of(testDeveloperProfile));
        when(contactRequestRepository.countBySenderUserIdAndCreatedAtAfter(eq(userId), any(LocalDateTime.class))).thenReturn(0L);
        when(settingService.getContactLimit()).thenReturn(10);

        ContactRequest contactRequest = new ContactRequest();
        contactRequest.setId(UUID.randomUUID());
        contactRequest.setSenderUserId(userId);
        contactRequest.setDeveloperId(developerProfileId);
        contactRequest.setMessage("Hello!");
        contactRequest.setStatus(ContactRequestStatus.PENDING);
        when(contactRequestRepository.save(any(ContactRequest.class))).thenReturn(contactRequest);

        UserDtos.ContactRequestDto dto = new UserDtos.ContactRequestDto("Hello!");
        UserDtos.ContactRequestResponse response = employerProfileService.sendContactRequest(userId, developerProfileId, dto);

        assertNotNull(response);
        assertEquals(ContactRequestStatus.PENDING, response.status());
        verify(contactRequestRepository).save(any(ContactRequest.class));
    }

    @Test
    void sendContactRequest_RateLimitExceeded_ThrowsContactRequestLimitExceededException() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(employerProfileRepository.findByUserId(userId)).thenReturn(Optional.of(testEmployerProfile));
        when(developerProfileRepository.findById(developerProfileId)).thenReturn(Optional.of(testDeveloperProfile));
        when(contactRequestRepository.countBySenderUserIdAndCreatedAtAfter(eq(userId), any(LocalDateTime.class))).thenReturn(10L);
        when(settingService.getContactLimit()).thenReturn(10);

        UserDtos.ContactRequestDto dto = new UserDtos.ContactRequestDto("Hello!");

        assertThrows(ContactRequestLimitExceededException.class,
                () -> employerProfileService.sendContactRequest(userId, developerProfileId, dto));
        verify(contactRequestRepository, never()).save(any());
    }


    @Test
    void sendContactRequest_DeveloperNotAvailable_ThrowsBadRequestException() {
        testDeveloperProfile.setAvailabilityStatus(AvailabilityStatus.NOT_AVAILABLE);
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(employerProfileRepository.findByUserId(userId)).thenReturn(Optional.of(testEmployerProfile));
        when(developerProfileRepository.findById(developerProfileId)).thenReturn(Optional.of(testDeveloperProfile));
        // Rate limit is checked AFTER availability in the service, so stub it to allow execution to reach that point
        lenient().when(contactRequestRepository.countBySenderUserIdAndCreatedAtAfter(eq(userId), any(LocalDateTime.class))).thenReturn(0L);

        UserDtos.ContactRequestDto dto = new UserDtos.ContactRequestDto("Hello!");

        assertThrows(BadRequestException.class,
                () -> employerProfileService.sendContactRequest(userId, developerProfileId, dto));
        verify(contactRequestRepository, never()).save(any());
    }

}
