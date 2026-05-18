package org.moseti.kedevsapi.users.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.moseti.kedevsapi.shared.enums.AvailabilityStatus;
import org.moseti.kedevsapi.shared.enums.ProfileVisibility;
import org.moseti.kedevsapi.shared.exception.BadRequestException;
import org.moseti.kedevsapi.shared.exception.ResourceNotFoundException;
import org.moseti.kedevsapi.users.dto.UserDtos;
import org.moseti.kedevsapi.users.entity.*;
import org.moseti.kedevsapi.users.exception.EndorsementNotAllowedException;
import org.moseti.kedevsapi.users.exception.ProfileAlreadyExistsException;
import org.moseti.kedevsapi.users.exception.ProfileNotFoundException;
import org.moseti.kedevsapi.users.repository.*;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DeveloperProfileServiceTest {

    @Mock private DeveloperProfileRepository profileRepository;
    @Mock private DeveloperSkillRepository skillRepository;
    @Mock private DeveloperLanguageRepository languageRepository;
    @Mock private DeveloperEducationRepository educationRepository;
    @Mock private DeveloperCertificationRepository certificationRepository;
    @Mock private DeveloperOssContributionRepository ossRepository;
    @Mock private DeveloperAchievementRepository achievementRepository;
    @Mock private DeveloperProjectRepository projectRepository;
    @Mock private EndorsementRepository endorsementRepository;
    @Mock private UserRepository userRepository;
    @Mock private org.moseti.kedevsapi.shared.service.FileUploadService fileUploadService;
    @Mock private org.moseti.kedevsapi.notifications.service.NotificationService notificationService;

    @InjectMocks
    private DeveloperProfileService developerProfileService;

    private UUID userId;
    private UUID profileId;
    private DeveloperProfile testProfile;
    private User testUser;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        profileId = UUID.randomUUID();

        testUser = new User();
        testUser.setId(userId);
        testUser.setFullName("Test Developer");
        testUser.setEmail("dev@example.com");

        testProfile = new DeveloperProfile();
        testProfile.setId(profileId);
        testProfile.setUserId(userId);
        testProfile.setFirstName("Jane");
        testProfile.setLastName("Dev");
        testProfile.setProfileVisibility(ProfileVisibility.PUBLIC);
        testProfile.setAvailabilityStatus(AvailabilityStatus.OPEN_TO_OFFERS);
        testProfile.setVerified(false);
        testProfile.setNumberOfProjects(0);
    }

    @Test
    void createProfile_Success() {
        when(profileRepository.existsByUserId(userId)).thenReturn(false);
        when(profileRepository.save(any(DeveloperProfile.class))).thenReturn(testProfile);
        stubSubRepoFinds(profileId);

        UserDtos.CreateDeveloperProfileRequest request = new UserDtos.CreateDeveloperProfileRequest(
                "Jane", "Dev", null, null, "Backend Dev",
                null, 0, AvailabilityStatus.OPEN_TO_OFFERS, null,
                "Nairobi", "Kenya", ProfileVisibility.PUBLIC,
                null, null, null, null, null, null, List.of());

        UserDtos.DeveloperProfileResponse response = developerProfileService.createProfile(userId, request);

        assertNotNull(response);
        assertEquals(profileId, response.id());
        verify(profileRepository).save(any(DeveloperProfile.class));
    }

    @Test
    void createProfile_Duplicate_ThrowsProfileAlreadyExistsException() {
        when(profileRepository.existsByUserId(userId)).thenReturn(true);

        UserDtos.CreateDeveloperProfileRequest request = new UserDtos.CreateDeveloperProfileRequest(
                "Jane", "Dev", null, null, null, null, 0,
                null, null, null, null, null, null, null, null, null, null, null, List.of());

        assertThrows(ProfileAlreadyExistsException.class,
                () -> developerProfileService.createProfile(userId, request));
        verify(profileRepository, never()).save(any());
    }

    @Test
    void getProfileByUserId_Success() {
        when(profileRepository.findByUserId(userId)).thenReturn(Optional.of(testProfile));
        stubSubRepoFinds(profileId);

        UserDtos.DeveloperProfileResponse response = developerProfileService.getProfileByUserId(userId);

        assertNotNull(response);
        assertEquals("Jane", response.firstName());
    }

    @Test
    void getPublicProfile_Success_WhenPublic() {
        when(profileRepository.findById(profileId)).thenReturn(Optional.of(testProfile));
        stubSubRepoFinds(profileId);

        UserDtos.DeveloperProfileResponse response = developerProfileService.getPublicProfile(profileId);

        assertNotNull(response);
    }

    @Test
    void getPublicProfile_Hidden_ThrowsProfileNotFoundException() {
        testProfile.setProfileVisibility(ProfileVisibility.HIDDEN);
        when(profileRepository.findById(profileId)).thenReturn(Optional.of(testProfile));

        assertThrows(ProfileNotFoundException.class,
                () -> developerProfileService.getPublicProfile(profileId));
    }

    @Test
    void getPublicProfile_Private_ReturnsProfile() {
        testProfile.setProfileVisibility(ProfileVisibility.PRIVATE);
        when(profileRepository.findById(profileId)).thenReturn(Optional.of(testProfile));
        stubSubRepoFinds(profileId);

        org.springframework.security.core.Authentication auth = mock(org.springframework.security.core.Authentication.class);
        when(auth.isAuthenticated()).thenReturn(true);
        when(auth.getPrincipal()).thenReturn(userId);
        org.springframework.security.core.context.SecurityContextHolder.getContext().setAuthentication(auth);

        try {
            UserDtos.DeveloperProfileResponse response = developerProfileService.getPublicProfile(profileId);
            assertNotNull(response);
        } finally {
            org.springframework.security.core.context.SecurityContextHolder.clearContext();
        }
    }

    @Test
    void getPublicProfile_Private_Unauthenticated_ThrowsAccessDeniedException() {
        testProfile.setProfileVisibility(ProfileVisibility.PRIVATE);
        when(profileRepository.findById(profileId)).thenReturn(Optional.of(testProfile));

        org.springframework.security.core.context.SecurityContextHolder.clearContext();

        assertThrows(org.springframework.security.access.AccessDeniedException.class,
                () -> developerProfileService.getPublicProfile(profileId));
    }

    @Test
    void toggleAvailability_Success() {
        when(profileRepository.findByUserId(userId)).thenReturn(Optional.of(testProfile));
        when(profileRepository.save(any(DeveloperProfile.class))).thenReturn(testProfile);

        developerProfileService.toggleAvailability(userId, AvailabilityStatus.OPEN_TO_OFFERS);

        assertEquals(AvailabilityStatus.OPEN_TO_OFFERS, testProfile.getAvailabilityStatus());
        verify(profileRepository).save(testProfile);
    }

    @Test
    void addSkill_Success() {
        when(profileRepository.findByUserId(userId)).thenReturn(Optional.of(testProfile));
        when(skillRepository.save(any(DeveloperSkill.class))).thenAnswer(inv -> inv.getArgument(0));

        developerProfileService.addSkill(userId, "Java");

        verify(skillRepository).save(any(DeveloperSkill.class));
    }

    @Test
    void removeSkill_Success() {
        when(profileRepository.findByUserId(userId)).thenReturn(Optional.of(testProfile));

        developerProfileService.removeSkill(userId, "Java");

        verify(skillRepository).deleteByDeveloperIdAndSkillIgnoreCase(profileId, "Java");
    }

    @Test
    void addEndorsement_Success() {
        UUID authorUserId = UUID.randomUUID();
        when(profileRepository.findById(profileId)).thenReturn(Optional.of(testProfile));
        when(userRepository.findById(authorUserId)).thenReturn(Optional.of(testUser));

        DeveloperProfile authorProfile = new DeveloperProfile();
        authorProfile.setId(UUID.randomUUID());
        authorProfile.setUserId(authorUserId);
        when(profileRepository.findByUserId(authorUserId)).thenReturn(Optional.of(authorProfile));

        Endorsement endorsement = new Endorsement();
        endorsement.setId(UUID.randomUUID());
        endorsement.setRecipientId(profileId);
        endorsement.setAuthorId(authorUserId);
        endorsement.setContent("Great developer!");

        when(endorsementRepository.save(any(Endorsement.class))).thenReturn(endorsement);

        UserDtos.CreateEndorsementRequest request = new UserDtos.CreateEndorsementRequest("Great developer!");
        UserDtos.EndorsementResponse response = developerProfileService.addEndorsement(authorUserId, profileId, request);

        assertNotNull(response);
        assertEquals("Great developer!", response.content());
        verify(endorsementRepository).save(any(Endorsement.class));
    }

    @Test
    void addEndorsement_SelfEndorsement_ThrowsEndorsementNotAllowedException() {
        // Author is the profile owner
        when(profileRepository.findById(profileId)).thenReturn(Optional.of(testProfile));

        UserDtos.CreateEndorsementRequest request = new UserDtos.CreateEndorsementRequest("Self praise");

        assertThrows(EndorsementNotAllowedException.class,
                () -> developerProfileService.addEndorsement(userId, profileId, request));
        verify(endorsementRepository, never()).save(any());
    }

    @Test
    void deleteEndorsement_Success() {
        UUID endorsementId = UUID.randomUUID();
        when(profileRepository.findByUserId(userId)).thenReturn(Optional.of(testProfile));

        Endorsement endorsement = new Endorsement();
        endorsement.setId(endorsementId);
        endorsement.setRecipientId(profileId);
        endorsement.setAuthorId(UUID.randomUUID());
        endorsement.setContent("Great dev");

        when(endorsementRepository.findById(endorsementId)).thenReturn(Optional.of(endorsement));

        developerProfileService.deleteEndorsement(userId, endorsementId);

        verify(endorsementRepository).delete(endorsement);
    }

    @Test
    void deleteEndorsement_WrongProfile_ThrowsBadRequestException() {
        UUID endorsementId = UUID.randomUUID();
        when(profileRepository.findByUserId(userId)).thenReturn(Optional.of(testProfile));

        Endorsement endorsement = new Endorsement();
        endorsement.setId(endorsementId);
        endorsement.setRecipientId(UUID.randomUUID()); // different profile
        endorsement.setAuthorId(UUID.randomUUID());
        endorsement.setContent("Great dev");

        when(endorsementRepository.findById(endorsementId)).thenReturn(Optional.of(endorsement));

        assertThrows(BadRequestException.class,
                () -> developerProfileService.deleteEndorsement(userId, endorsementId));
        verify(endorsementRepository, never()).delete(any());
    }

    @Test
    void getPublicDevelopers_OnlyReturnsPublicProfiles() {
        DeveloperProfile hiddenProfile = new DeveloperProfile();
        hiddenProfile.setId(UUID.randomUUID());
        hiddenProfile.setProfileVisibility(ProfileVisibility.HIDDEN);

        Page<DeveloperProfile> publicPage = new PageImpl<>(List.of(testProfile));
        when(profileRepository.findByProfileVisibility(eq(ProfileVisibility.PUBLIC), any(Pageable.class)))
                .thenReturn(publicPage);
        when(skillRepository.findByDeveloperId(any())).thenReturn(List.of());

        Pageable pageable = PageRequest.of(0, 10);
        Page<UserDtos.DeveloperSummaryResponse> result = developerProfileService.getPublicDevelopers(pageable);

        assertEquals(1, result.getTotalElements());
        // The PUBLIC profile is in results — verify repository was called with PUBLIC only
        verify(profileRepository).findByProfileVisibility(ProfileVisibility.PUBLIC, pageable);
    }

    @Test
    void filterDevelopers_WithAvailabilityFilter() {
        Page<DeveloperProfile> page = new PageImpl<>(List.of(testProfile));
        when(profileRepository.findByProfileVisibility(eq(ProfileVisibility.PUBLIC), any(Pageable.class)))
                .thenReturn(page);
        when(skillRepository.findByDeveloperId(any())).thenReturn(List.of());

        UserDtos.DeveloperFilterRequest filter = new UserDtos.DeveloperFilterRequest(
                AvailabilityStatus.OPEN_TO_OFFERS, null, null, null, null, null, null, null, null, null);

        Page<UserDtos.DeveloperSummaryResponse> result = developerProfileService.filterDevelopers(filter, PageRequest.of(0, 10));

        assertEquals(1, result.getTotalElements());
    }

    @Test
    void updateVisibility_Success() {
        when(profileRepository.findByUserId(userId)).thenReturn(Optional.of(testProfile));
        when(profileRepository.save(any(DeveloperProfile.class))).thenReturn(testProfile);

        developerProfileService.updateVisibility(userId, ProfileVisibility.PRIVATE);

        assertEquals(ProfileVisibility.PRIVATE, testProfile.getProfileVisibility());
        verify(profileRepository).save(testProfile);
    }

    @Test
    void uploadVerificationDocument_Success() {
        when(profileRepository.findByUserId(userId)).thenReturn(Optional.of(testProfile));
        when(fileUploadService.uploadFile(any(), anyString())).thenReturn("http://cloud/gov-id.pdf");
        when(profileRepository.save(any(DeveloperProfile.class))).thenReturn(testProfile);
        stubSubRepoFinds(profileId);

        org.springframework.web.multipart.MultipartFile mockFile = mock(org.springframework.web.multipart.MultipartFile.class);

        UserDtos.DeveloperProfileResponse response = developerProfileService.uploadVerificationDocument(userId, mockFile);

        assertNotNull(response);
        assertEquals("http://cloud/gov-id.pdf", testProfile.getGovernmentIdUrl());
        verify(fileUploadService).uploadFile(mockFile, "kedevs/developer-verification");
        verify(profileRepository).save(testProfile);
    }

    @Test
    void addEducation_Success() {
        when(profileRepository.findByUserId(userId)).thenReturn(Optional.of(testProfile));

        DeveloperEducation education = new DeveloperEducation();
        education.setId(UUID.randomUUID());
        education.setInstitution("KU");
        education.setQualification("BSc CS");
        education.setYearCompleted(2020);

        when(educationRepository.save(any(DeveloperEducation.class))).thenReturn(education);

        UserDtos.AddEducationRequest request = new UserDtos.AddEducationRequest("KU", "BSc CS", "Computer Science", 2016, 2020, false);
        UserDtos.EducationResponse response = developerProfileService.addEducation(userId, request);

        assertNotNull(response);
        assertEquals("KU", response.institution());
    }

    @Test
    void deleteEducation_WrongProfile_ThrowsBadRequestException() {
        when(profileRepository.findByUserId(userId)).thenReturn(Optional.of(testProfile));

        UUID educationId = UUID.randomUUID();
        DeveloperEducation education = new DeveloperEducation();
        education.setId(educationId);
        education.setDeveloperId(UUID.randomUUID()); // different profile ID

        when(educationRepository.findById(educationId)).thenReturn(Optional.of(education));

        assertThrows(BadRequestException.class,
                () -> developerProfileService.deleteEducation(userId, educationId));
    }

    // Helper to stub all sub-repo find calls returning empty lists
    private void stubSubRepoFinds(UUID pid) {
        when(skillRepository.findByDeveloperId(pid)).thenReturn(List.of());
        when(languageRepository.findByDeveloperId(pid)).thenReturn(List.of());
        when(educationRepository.findByDeveloperId(pid)).thenReturn(List.of());
        when(certificationRepository.findByDeveloperId(pid)).thenReturn(List.of());
        when(ossRepository.findByDeveloperId(pid)).thenReturn(List.of());
        when(achievementRepository.findByDeveloperId(pid)).thenReturn(List.of());
        when(projectRepository.findByDeveloperId(pid)).thenReturn(List.of());
    }
}
