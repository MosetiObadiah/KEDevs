package org.moseti.kedevsapi.spotlight.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.moseti.kedevsapi.shared.enums.SpotlightType;
import org.moseti.kedevsapi.shared.util.Constants;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.moseti.kedevsapi.admin.entity.AdminAction;
import org.moseti.kedevsapi.admin.entity.AdminActionTypes;
import org.moseti.kedevsapi.admin.repository.AdminActionRepository;

@Service
@RequiredArgsConstructor
@Slf4j
public class SpotlightService {

    private final SpotlightSlotRepository spotlightSlotRepository;
    private final DeveloperProfileRepository developerProfileRepository;
    private final DeveloperProjectRepository developerProjectRepository;
    private final UserRepository userRepository;
    private final org.moseti.kedevsapi.payments.repository.PlatformSettingRepository platformSettingRepository;
    private final org.moseti.kedevsapi.notifications.service.NotificationService notificationService;
    private final org.moseti.kedevsapi.auth.service.EmailService emailService;
    private final AdminActionRepository adminActionRepository;

    public SlotAvailabilityResponse checkSlotAvailability() {
        boolean daySlotTaken = spotlightSlotRepository.existsByTypeAndIsActiveTrue(SpotlightType.DAY);
        boolean weekSlotTaken = spotlightSlotRepository.existsByTypeAndIsActiveTrue(SpotlightType.WEEK);

        LocalDateTime dayExpiry = null;
        if (daySlotTaken) {
            dayExpiry = spotlightSlotRepository.findByTypeAndIsActiveTrue(SpotlightType.DAY)
                    .map(SpotlightSlot::getEndDate)
                    .orElse(null);
        }

        LocalDateTime weekExpiry = null;
        if (weekSlotTaken) {
            weekExpiry = spotlightSlotRepository.findByTypeAndIsActiveTrue(SpotlightType.WEEK)
                    .map(SpotlightSlot::getEndDate)
                    .orElse(null);
        }

        double dayPrice = platformSettingRepository.findBySettingKey("SPOTLIGHT_DAY_FEE")
                .map(s -> Double.parseDouble(s.getSettingValue()))
                .orElse((double) Constants.DEFAULT_SPOTLIGHT_DAY_FEE);
        double weekPrice = platformSettingRepository.findBySettingKey("SPOTLIGHT_WEEK_FEE")
                .map(s -> Double.parseDouble(s.getSettingValue()))
                .orElse((double) Constants.DEFAULT_SPOTLIGHT_WEEK_FEE);

        return new SlotAvailabilityResponse(
                !daySlotTaken,
                !weekSlotTaken,
                dayExpiry,
                weekExpiry,
                dayPrice,
                weekPrice
        );
    }

    /**
     * Creates a spotlight slot as INACTIVE during payment initiation.
     * The slot will only become active after Daraja confirms payment success.
     */
    @Transactional
    public SpotlightSlot createInactiveSlot(UUID developerId, UUID paymentId, SpotlightType type) {
        // Idempotency check – do not create duplicate slots for the same payment
        SpotlightSlot existingSlot = spotlightSlotRepository.findByPaymentId(paymentId).orElse(null);
        if (existingSlot != null) {
            return existingSlot;
        }

        // Check if developer already has an ACTIVE slot of the same type
        if (spotlightSlotRepository.findByDeveloperIdAndTypeAndIsActiveTrue(developerId, type).isPresent()) {
            throw new SpotlightAlreadyActiveException("You already have an active spotlight slot of this type");
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime endDate = type == SpotlightType.DAY
                ? now.plusHours(Constants.SPOTLIGHT_DAY_DURATION_HOURS)
                : now.plusDays(Constants.SPOTLIGHT_WEEK_DURATION_DAYS);

        SpotlightSlot slot = new SpotlightSlot();
        slot.setDeveloperId(developerId);
        slot.setType(type);
        slot.setStartDate(now);
        slot.setEndDate(endDate);
        slot.setPaymentId(paymentId);
        slot.setActive(false); // inactive until payment confirmed
        slot.setOverriddenByAdmin(false);

        return spotlightSlotRepository.save(slot);
    }

    /**
     * Activates an existing (inactive) spotlight slot once Daraja confirms payment success.
     * Called from PaymentService.processSuccessfulPayment().
     */
    @Transactional
    public SpotlightSlot activateExistingSlot(UUID paymentId) {
        SpotlightSlot slot = spotlightSlotRepository.findByPaymentId(paymentId)
                .orElseThrow(() -> new RuntimeException("Spotlight slot not found for payment " + paymentId));
        slot.setActive(true);
        return spotlightSlotRepository.save(slot);
    }

    /**
     * Deletes an inactive spotlight slot when a payment fails or is cancelled.
     * Only removes INACTIVE slots – never removes admin-overridden or active slots.
     * Called from PaymentService.handleCallback() on FAILED/CANCELLED status.
     */
    @Transactional
    public void deleteInactiveSlotByPaymentId(UUID paymentId) {
        spotlightSlotRepository.findByPaymentId(paymentId).ifPresent(slot -> {
            if (!slot.isActive() && !slot.isOverriddenByAdmin()) {
                spotlightSlotRepository.delete(slot);
                log.info("Deleted inactive spotlight slot for failed payment {}", paymentId);
            }
        });
    }

    /**
     * @deprecated Use createInactiveSlot() + activateExistingSlot() instead.
     * Kept for the confirmSpotlight() dev-only flow which handles both steps atomically.
     */
    @Deprecated
    @Transactional
    public SpotlightSlot activateSpotlight(UUID developerId, UUID paymentId, SpotlightType type) {
        // For the manual confirm path: create slot if absent, then immediately activate
        SpotlightSlot slot = spotlightSlotRepository.findByPaymentId(paymentId).orElse(null);
        if (slot == null) {
            slot = createInactiveSlot(developerId, paymentId, type);
        }
        slot.setActive(true);
        return spotlightSlotRepository.save(slot);
    }

    public CurrentSpotlightResponse getCurrentSpotlight() {
        DeveloperSpotlightCard dayCard = spotlightSlotRepository.findByTypeAndIsActiveTrue(SpotlightType.DAY)
                .map(slot -> buildDeveloperCard(slot.getDeveloperId()))
                .orElse(null);

        DeveloperSpotlightCard weekCard = spotlightSlotRepository.findByTypeAndIsActiveTrue(SpotlightType.WEEK)
                .map(slot -> buildDeveloperCard(slot.getDeveloperId()))
                .orElse(null);

        return new CurrentSpotlightResponse(dayCard, weekCard);
    }

    public Page<SpotlightSlotResponse> getSlotHistory(Pageable pageable) {
        return spotlightSlotRepository.findAll(pageable)
                .map(slot -> {
                    String devName = userRepository.findById(slot.getDeveloperId())
                            .map(User::getFullName)
                            .orElse("Unknown Developer");

                    return new SpotlightSlotResponse(
                            slot.getId(),
                            slot.getDeveloperId(),
                            devName,
                            slot.getType(),
                            slot.getStartDate(),
                            slot.getEndDate(),
                            slot.isActive(),
                            slot.isOverriddenByAdmin(),
                            slot.getPaymentId(),
                            slot.getCreatedAt()
                    );
                });
    }

    public Page<PastSpotlightResponse> getPastSpotlights(Pageable pageable) {
        return spotlightSlotRepository.findAllByIsActiveFalseAndOverriddenByAdminFalseOrderByEndDateDesc(pageable)
                .map(this::mapToPastSpotlightResponse);
    }

    public List<PastSpotlightResponse> getPastSpotlightsForExport() {
        return spotlightSlotRepository.findAllByIsActiveFalseAndOverriddenByAdminFalseOrderByEndDateDesc()
                .stream()
                .map(this::mapToPastSpotlightResponse)
                .toList();
    }

    private PastSpotlightResponse mapToPastSpotlightResponse(SpotlightSlot slot) {
        DeveloperProfile profile = developerProfileRepository.findByUserId(slot.getDeveloperId()).orElse(null);
        String developerName = userRepository.findById(slot.getDeveloperId())
                .map(User::getFullName)
                .orElse("Unknown Developer");

        return new PastSpotlightResponse(
                slot.getId(),
                profile != null ? profile.getId() : slot.getDeveloperId(),
                developerName,
                profile != null ? profile.getProfilePhoto() : null,
                profile != null ? profile.getCurrentLastRole() : null,
                slot.getType(),
                slot.getStartDate(),
                slot.getEndDate()
        );
    }

    public SpotlightSlotResponse getMySpotlightStatus(UUID developerId) {
        return spotlightSlotRepository.findByDeveloperIdAndIsActiveTrue(developerId)
                .map(slot -> {
                    String devName = userRepository.findById(slot.getDeveloperId())
                            .map(User::getFullName)
                            .orElse("Unknown Developer");
                    return new SpotlightSlotResponse(
                            slot.getId(),
                            slot.getDeveloperId(),
                            devName,
                            slot.getType(),
                            slot.getStartDate(),
                            slot.getEndDate(),
                            slot.isActive(),
                            slot.isOverriddenByAdmin(),
                            slot.getPaymentId(),
                            slot.getCreatedAt()
                    );
                })
                .orElse(null);
    }

    @Transactional
    public SpotlightSlotResponse adminOverride(UUID adminId, UUID slotId, AdminOverrideRequest request) {
        SpotlightSlot slot = spotlightSlotRepository.findById(slotId)
                .orElseThrow(() -> new SpotlightSlotNotFoundException("Spotlight slot not found"));

        slot.setActive(false);
        slot.setOverriddenByAdmin(true);
        spotlightSlotRepository.save(slot);

        // Audit log
        AdminAction action = new AdminAction();
        action.setAdminId(adminId);
        action.setActionType(AdminActionTypes.OVERRIDE_SPOTLIGHT);
        action.setTargetType("SPOTLIGHT_SLOT");
        action.setTargetId(slot.getId());
        action.setNotes(request.reason());
        action.setOutcome("OVERRIDDEN");
        adminActionRepository.save(action);

        User developer = userRepository.findById(slot.getDeveloperId()).orElse(null);
        if (developer != null) {
            notificationService.notify(
                    slot.getDeveloperId(),
                    org.moseti.kedevsapi.shared.enums.NotificationCategory.SPOTLIGHT,
                    "Spotlight Removed",
                    "Your spotlight has been removed by an admin. Reason: " + request.reason(),
                    null
            );
            emailService.sendSpotlightOverriddenEmail(developer.getEmail(), developer.getFullName(), request.reason());
        }

        String devName = userRepository.findById(slot.getDeveloperId())
                .map(User::getFullName)
                .orElse("Unknown Developer");

        return new SpotlightSlotResponse(
                slot.getId(),
                slot.getDeveloperId(),
                devName,
                slot.getType(),
                slot.getStartDate(),
                slot.getEndDate(),
                slot.isActive(),
                slot.isOverriddenByAdmin(),
                slot.getPaymentId(),
                slot.getCreatedAt()
        );
    }

    @Scheduled(fixedRate = 60000)
    @Transactional
    public void expireSlots() {
        List<SpotlightSlot> expiredSlots = spotlightSlotRepository
                .findAllByIsActiveTrueAndEndDateBefore(LocalDateTime.now());

        if (!expiredSlots.isEmpty()) {
            expiredSlots.forEach(slot -> slot.setActive(false));
            spotlightSlotRepository.saveAll(expiredSlots);
            log.info("Expired {} spotlight slots", expiredSlots.size());
            expiredSlots.forEach(slot -> {
                User developer = userRepository.findById(slot.getDeveloperId()).orElse(null);
                if (developer != null) {
                    notificationService.notify(
                            slot.getDeveloperId(),
                            org.moseti.kedevsapi.shared.enums.NotificationCategory.SPOTLIGHT,
                            "Spotlight Ended",
                            "Your Dev of the " + slot.getType() + " spotlight has ended.",
                            null
                    );
                    emailService.sendSpotlightExpiredEmail(developer.getEmail(), developer.getFullName(), slot.getType().name());
                }
            });
        }
    }

    private DeveloperSpotlightCard buildDeveloperCard(UUID developerId) {
        DeveloperProfile profile = developerProfileRepository.findByUserId(developerId).orElse(null);
        if (profile == null) {
            return null;
        }

        String developerName = userRepository.findById(developerId)
                .map(User::getFullName)
                .orElse("Unknown Developer");

        List<FeaturedProject> featuredProjects = developerProjectRepository
                .findByDeveloperIdAndIsFeatured(profile.getId(), true).stream()
                .limit(3)
                .map(p -> {
                    List<String> techStackList = p.getTechStack() != null && !p.getTechStack().isBlank()
                            ? java.util.Arrays.stream(p.getTechStack().split(","))
                                    .map(String::trim)
                                    .filter(s -> !s.isEmpty())
                                    .collect(java.util.stream.Collectors.toList())
                            : java.util.Collections.emptyList();
                    return new FeaturedProject(
                            p.getTitle(),
                            p.getDescription(),
                            techStackList,
                            p.getProjectUrl(),
                            p.getRepoUrl(),
                            p.getScreenshotUrl()
                    );
                })
                .toList();

        return new DeveloperSpotlightCard(
                profile.getId(),
                developerName,
                profile.getProfilePhoto(),
                profile.getBio(),
                profile.getCurrentLastRole(),
                profile.getLocationCity(),
                profile.getLocationCountry(),
                profile.isVerified(),
                featuredProjects
        );
    }
}
