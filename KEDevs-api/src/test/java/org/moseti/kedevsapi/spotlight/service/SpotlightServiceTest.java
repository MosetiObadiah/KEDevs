package org.moseti.kedevsapi.spotlight.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.moseti.kedevsapi.shared.enums.SpotlightType;
import org.moseti.kedevsapi.spotlight.dto.SpotlightDtos.*;
import org.moseti.kedevsapi.spotlight.entity.SpotlightSlot;
import org.moseti.kedevsapi.spotlight.exception.SpotlightAlreadyActiveException;
import org.moseti.kedevsapi.spotlight.exception.SpotlightSlotNotFoundException;
import org.moseti.kedevsapi.spotlight.repository.SpotlightSlotRepository;
import org.moseti.kedevsapi.users.entity.DeveloperProfile;
import org.moseti.kedevsapi.users.entity.DeveloperProject;
import org.moseti.kedevsapi.users.entity.User;
import org.moseti.kedevsapi.users.repository.DeveloperProfileRepository;
import org.moseti.kedevsapi.users.repository.DeveloperProjectRepository;
import org.moseti.kedevsapi.users.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SpotlightServiceTest {

    @Mock
    private SpotlightSlotRepository spotlightSlotRepository;
    @Mock
    private DeveloperProfileRepository developerProfileRepository;
    @Mock
    private DeveloperProjectRepository developerProjectRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private org.moseti.kedevsapi.notifications.service.NotificationService notificationService;
    @Mock
    private org.moseti.kedevsapi.auth.service.EmailService emailService;
    @Mock
    private org.moseti.kedevsapi.payments.repository.PlatformSettingRepository platformSettingRepository;
    @Mock
    private org.moseti.kedevsapi.admin.repository.AdminActionRepository adminActionRepository;

    @InjectMocks
    private SpotlightService spotlightService;

    private UUID developerId;
    private UUID paymentId;
    private UUID slotId;
    private UUID adminId;

    @BeforeEach
    void setUp() {
        developerId = UUID.randomUUID();
        paymentId = UUID.randomUUID();
        slotId = UUID.randomUUID();
        adminId = UUID.randomUUID();
    }

    @Test
    void activateSpotlight_day_success() {
        when(spotlightSlotRepository.findByPaymentId(paymentId)).thenReturn(Optional.empty());
        when(spotlightSlotRepository.findByDeveloperIdAndTypeAndIsActiveTrue(developerId, SpotlightType.DAY))
                .thenReturn(Optional.empty());
        when(spotlightSlotRepository.save(any(SpotlightSlot.class))).thenAnswer(i -> {
            SpotlightSlot s = i.getArgument(0);
            s.setId(slotId);
            return s;
        });

        SpotlightSlot slot = spotlightService.activateSpotlight(developerId, paymentId, SpotlightType.DAY);

        assertNotNull(slot);
        assertEquals(developerId, slot.getDeveloperId());
        assertEquals(SpotlightType.DAY, slot.getType());
        assertTrue(slot.isActive());
        assertTrue(slot.getStartDate().isBefore(slot.getEndDate()));
        verify(spotlightSlotRepository, atLeastOnce()).save(any(SpotlightSlot.class));
    }

    @Test
    void activateSpotlight_week_success() {
        when(spotlightSlotRepository.findByPaymentId(paymentId)).thenReturn(Optional.empty());
        when(spotlightSlotRepository.findByDeveloperIdAndTypeAndIsActiveTrue(developerId, SpotlightType.WEEK))
                .thenReturn(Optional.empty());
        when(spotlightSlotRepository.save(any(SpotlightSlot.class))).thenAnswer(i -> {
            SpotlightSlot s = i.getArgument(0);
            s.setId(slotId);
            return s;
        });

        SpotlightSlot slot = spotlightService.activateSpotlight(developerId, paymentId, SpotlightType.WEEK);

        assertNotNull(slot);
        assertEquals(SpotlightType.WEEK, slot.getType());
        verify(spotlightSlotRepository, atLeastOnce()).save(any(SpotlightSlot.class));
    }

    @Test
    void activateSpotlight_idempotent_samePaymentId_returnsExisting() {
        SpotlightSlot existing = new SpotlightSlot();
        existing.setId(slotId);
        when(spotlightSlotRepository.findByPaymentId(paymentId)).thenReturn(Optional.of(existing));
        when(spotlightSlotRepository.save(any(SpotlightSlot.class))).thenAnswer(i -> i.getArgument(0));

        SpotlightSlot slot = spotlightService.activateSpotlight(developerId, paymentId, SpotlightType.DAY);

        assertEquals(slotId, slot.getId());
        verify(spotlightSlotRepository, atLeastOnce()).save(any(SpotlightSlot.class));
    }

    @Test
    void activateSpotlight_developerAlreadyActive_throws() {
        when(spotlightSlotRepository.findByPaymentId(paymentId)).thenReturn(Optional.empty());
        when(spotlightSlotRepository.findByDeveloperIdAndTypeAndIsActiveTrue(developerId, SpotlightType.DAY))
                .thenReturn(Optional.of(new SpotlightSlot()));

        assertThrows(SpotlightAlreadyActiveException.class, () ->
                spotlightService.activateSpotlight(developerId, paymentId, SpotlightType.DAY));
    }

    @Test
    void getCurrentSpotlight_bothSlots_returnsBothCards() {
        SpotlightSlot daySlot = new SpotlightSlot();
        daySlot.setDeveloperId(developerId);
        SpotlightSlot weekSlot = new SpotlightSlot();
        weekSlot.setDeveloperId(developerId);

        when(spotlightSlotRepository.findByTypeAndIsActiveTrue(SpotlightType.DAY)).thenReturn(Optional.of(daySlot));
        when(spotlightSlotRepository.findByTypeAndIsActiveTrue(SpotlightType.WEEK)).thenReturn(Optional.of(weekSlot));

        DeveloperProfile profile = new DeveloperProfile();
        profile.setUserId(developerId);
        when(developerProfileRepository.findByUserId(developerId)).thenReturn(Optional.of(profile));
        
        User devUser = new User();
        devUser.setFullName("Test Dev");
        when(userRepository.findById(developerId)).thenReturn(Optional.of(devUser));

        CurrentSpotlightResponse res = spotlightService.getCurrentSpotlight();

        assertNotNull(res.daySlot());
        assertNotNull(res.weekSlot());
        assertEquals("Test Dev", res.daySlot().developerName());
    }

    @Test
    void getCurrentSpotlight_noActiveSlots_returnsNullFields() {
        when(spotlightSlotRepository.findByTypeAndIsActiveTrue(SpotlightType.DAY)).thenReturn(Optional.empty());
        when(spotlightSlotRepository.findByTypeAndIsActiveTrue(SpotlightType.WEEK)).thenReturn(Optional.empty());

        CurrentSpotlightResponse res = spotlightService.getCurrentSpotlight();

        assertNull(res.daySlot());
        assertNull(res.weekSlot());
    }

    @Test
    void getCurrentSpotlight_developerProfileNotFound_returnsNull() {
        SpotlightSlot daySlot = new SpotlightSlot();
        daySlot.setDeveloperId(developerId);
        when(spotlightSlotRepository.findByTypeAndIsActiveTrue(SpotlightType.DAY)).thenReturn(Optional.of(daySlot));
        when(spotlightSlotRepository.findByTypeAndIsActiveTrue(SpotlightType.WEEK)).thenReturn(Optional.empty());

        when(developerProfileRepository.findByUserId(developerId)).thenReturn(Optional.empty());

        CurrentSpotlightResponse res = spotlightService.getCurrentSpotlight();

        assertNull(res.daySlot());
    }

    @Test
    void checkSlotAvailability_bothAvailable() {
        when(spotlightSlotRepository.existsByTypeAndIsActiveTrue(SpotlightType.DAY)).thenReturn(false);
        when(spotlightSlotRepository.existsByTypeAndIsActiveTrue(SpotlightType.WEEK)).thenReturn(false);

        SlotAvailabilityResponse res = spotlightService.checkSlotAvailability();

        assertTrue(res.daySlotAvailable());
        assertTrue(res.weekSlotAvailable());
        assertNull(res.daySlotExpiresAt());
        assertNull(res.weekSlotExpiresAt());
    }

    @Test
    void checkSlotAvailability_dayTaken_returnsExpiry() {
        when(spotlightSlotRepository.existsByTypeAndIsActiveTrue(SpotlightType.DAY)).thenReturn(true);
        when(spotlightSlotRepository.existsByTypeAndIsActiveTrue(SpotlightType.WEEK)).thenReturn(false);
        
        SpotlightSlot slot = new SpotlightSlot();
        LocalDateTime expiry = LocalDateTime.now().plusHours(1);
        slot.setEndDate(expiry);
        when(spotlightSlotRepository.findByTypeAndIsActiveTrue(SpotlightType.DAY)).thenReturn(Optional.of(slot));

        SlotAvailabilityResponse res = spotlightService.checkSlotAvailability();

        assertFalse(res.daySlotAvailable());
        assertTrue(res.weekSlotAvailable());
        assertEquals(expiry, res.daySlotExpiresAt());
    }

    @Test
    void adminOverride_success_setsFlags() {
        SpotlightSlot slot = new SpotlightSlot();
        slot.setId(slotId);
        slot.setDeveloperId(developerId);
        slot.setActive(true);
        when(spotlightSlotRepository.findById(slotId)).thenReturn(Optional.of(slot));

        User user = new User();
        user.setId(developerId);
        user.setFullName("Dev");
        user.setEmail("dev@test.com");
        when(userRepository.findById(developerId)).thenReturn(Optional.of(user));

        SpotlightSlotResponse res = spotlightService.adminOverride(adminId, slotId, new AdminOverrideRequest("Rules violation"));

        assertFalse(res.isActive());
        assertTrue(res.overriddenByAdmin());
        verify(spotlightSlotRepository).save(slot);
        verify(notificationService).notify(any(), any(), any(), any(), any());
        verify(emailService).sendSpotlightOverriddenEmail(any(), any(), any());
        verify(adminActionRepository).save(any());
    }

    @Test
    void adminOverride_slotNotFound_throws() {
        when(spotlightSlotRepository.findById(slotId)).thenReturn(Optional.empty());

        assertThrows(SpotlightSlotNotFoundException.class, () -> 
                spotlightService.adminOverride(adminId, slotId, new AdminOverrideRequest("Reason")));
    }

    @Test
    void expireSlots_expiredSlotsDeactivated() {
        SpotlightSlot slot1 = new SpotlightSlot();
        slot1.setDeveloperId(developerId);
        slot1.setType(SpotlightType.DAY);
        slot1.setActive(true);
        when(spotlightSlotRepository.findAllByIsActiveTrueAndEndDateBefore(any())).thenReturn(List.of(slot1));

        User user = new User();
        user.setId(developerId);
        user.setFullName("Dev");
        user.setEmail("dev@test.com");
        when(userRepository.findById(developerId)).thenReturn(Optional.of(user));

        spotlightService.expireSlots();

        assertFalse(slot1.isActive());
        verify(spotlightSlotRepository).saveAll(anyList());
        verify(notificationService).notify(any(), any(), any(), any(), any());
        verify(emailService).sendSpotlightExpiredEmail(any(), any(), any());
    }

    @Test
    void expireSlots_futureSlots_notAffected() {
        when(spotlightSlotRepository.findAllByIsActiveTrueAndEndDateBefore(any())).thenReturn(List.of());

        spotlightService.expireSlots();

        verify(spotlightSlotRepository, never()).saveAll(anyList());
    }

    @Test
    void buildDeveloperCard_includesFeaturedProjectsOnly() {
        SpotlightSlot daySlot = new SpotlightSlot();
        daySlot.setDeveloperId(developerId);
        when(spotlightSlotRepository.findByTypeAndIsActiveTrue(SpotlightType.DAY)).thenReturn(Optional.of(daySlot));
        when(spotlightSlotRepository.findByTypeAndIsActiveTrue(SpotlightType.WEEK)).thenReturn(Optional.empty());

        DeveloperProfile profile = new DeveloperProfile();
        profile.setId(developerId);
        when(developerProfileRepository.findByUserId(developerId)).thenReturn(Optional.of(profile));
        
        User devUser = new User();
        devUser.setFullName("Dev");
        when(userRepository.findById(developerId)).thenReturn(Optional.of(devUser));

        DeveloperProject p1 = new DeveloperProject();
        p1.setTitle("Project 1");
        
        when(developerProjectRepository.findByDeveloperIdAndIsFeatured(developerId, true)).thenReturn(List.of(p1));

        CurrentSpotlightResponse res = spotlightService.getCurrentSpotlight();

        assertEquals(1, res.daySlot().featuredProjects().size());
        assertEquals("Project 1", res.daySlot().featuredProjects().get(0).title());
    }

    @Test
    void buildDeveloperCard_maxThreeProjects() {
        SpotlightSlot daySlot = new SpotlightSlot();
        daySlot.setDeveloperId(developerId);
        when(spotlightSlotRepository.findByTypeAndIsActiveTrue(SpotlightType.DAY)).thenReturn(Optional.of(daySlot));
        when(spotlightSlotRepository.findByTypeAndIsActiveTrue(SpotlightType.WEEK)).thenReturn(Optional.empty());

        DeveloperProfile profile = new DeveloperProfile();
        profile.setId(developerId);
        when(developerProfileRepository.findByUserId(developerId)).thenReturn(Optional.of(profile));
        
        User devUser = new User();
        devUser.setFullName("Dev");
        when(userRepository.findById(developerId)).thenReturn(Optional.of(devUser));

        DeveloperProject p1 = new DeveloperProject(); p1.setTitle("1");
        DeveloperProject p2 = new DeveloperProject(); p2.setTitle("2");
        DeveloperProject p3 = new DeveloperProject(); p3.setTitle("3");
        DeveloperProject p4 = new DeveloperProject(); p4.setTitle("4");
        
        when(developerProjectRepository.findByDeveloperIdAndIsFeatured(developerId, true))
            .thenReturn(List.of(p1, p2, p3, p4));

        CurrentSpotlightResponse res = spotlightService.getCurrentSpotlight();

        assertEquals(3, res.daySlot().featuredProjects().size());
    }
}
