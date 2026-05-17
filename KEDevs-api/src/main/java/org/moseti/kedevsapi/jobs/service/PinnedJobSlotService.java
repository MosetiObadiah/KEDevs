package org.moseti.kedevsapi.jobs.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.moseti.kedevsapi.admin.entity.AdminAction;
import org.moseti.kedevsapi.admin.entity.AdminActionTypes;
import org.moseti.kedevsapi.admin.repository.AdminActionRepository;
import org.moseti.kedevsapi.auth.service.EmailService;
import org.moseti.kedevsapi.jobs.dto.PinnedJobSlotDtos.*;
import org.moseti.kedevsapi.jobs.entity.JobPost;
import org.moseti.kedevsapi.jobs.entity.PinnedJobSlot;
import org.moseti.kedevsapi.jobs.repository.JobPostRepository;
import org.moseti.kedevsapi.jobs.repository.PinnedJobSlotRepository;
import org.moseti.kedevsapi.notifications.service.NotificationService;
import org.moseti.kedevsapi.shared.enums.PaymentType;
import org.moseti.kedevsapi.shared.enums.NotificationCategory;
import org.moseti.kedevsapi.users.entity.User;
import org.moseti.kedevsapi.users.repository.UserRepository;
import org.moseti.kedevsapi.payments.repository.PaymentRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PinnedJobSlotService {

    private final PinnedJobSlotRepository pinnedJobSlotRepository;
    private final JobPostRepository jobPostRepository;
    private final UserRepository userRepository;
    private final AdminActionRepository adminActionRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;
    private final PaymentRepository paymentRepository;

    @Transactional
    public PinnedJobSlot createInactiveSlot(UUID jobId, UUID employerId, UUID paymentId, PaymentType durationType) {
        checkNoDuplicateActiveSlot(jobId); // Prevent duplicate active slots
        
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime endDate = switch (durationType) {
            case PINNED_JOB_DAY -> now.plusDays(1);
            case PINNED_JOB_3DAYS -> now.plusDays(3);
            case PINNED_JOB_7DAYS -> now.plusDays(7);
            default -> throw new IllegalArgumentException("Invalid pinned job duration type");
        };

        PinnedJobSlot slot = new PinnedJobSlot();
        slot.setJobId(jobId);
        slot.setEmployerId(employerId);
        slot.setDurationType(durationType);
        slot.setStartDate(now);
        slot.setEndDate(endDate);
        slot.setPaymentId(paymentId);
        slot.setActive(false);
        slot.setOverriddenByAdmin(false);

        return pinnedJobSlotRepository.save(slot);
    }

    private void checkNoDuplicateActiveSlot(UUID jobId) {
        if (pinnedJobSlotRepository.findByJobIdAndIsActiveTrue(jobId).isPresent()) {
            throw new RuntimeException("This job is already actively pinned.");
        }
    }

    @Transactional
    public void activateExistingSlot(UUID paymentId, JobPost job) {
        PinnedJobSlot slot = pinnedJobSlotRepository.findByPaymentId(paymentId)
                .orElseThrow(() -> new RuntimeException("PinnedJobSlot not found for payment " + paymentId));
        
        slot.setActive(true);
        // Also update the job post properties
        job.setPinned(true);
        job.setPinnedUntil(slot.getEndDate());
        job.setPinnedPaymentId(paymentId);
        
        pinnedJobSlotRepository.save(slot);
        jobPostRepository.save(job);
    }

    @Transactional
    public void deleteInactiveSlotByPaymentId(UUID paymentId) {
        pinnedJobSlotRepository.findByPaymentId(paymentId).ifPresent(slot -> {
            if (!slot.isActive() && !slot.isOverriddenByAdmin()) {
                pinnedJobSlotRepository.delete(slot);
                log.info("Deleted inactive pinned job slot for failed payment {}", paymentId);
            }
        });
    }

    @Transactional
    public void syncPinnedSlots() {
        List<JobPost> activePinnedJobs = jobPostRepository.findByIsPinnedTrueAndPinnedUntilAfterOrderByPinnedUntilDesc(LocalDateTime.now());
        for (JobPost job : activePinnedJobs) {
            Optional<PinnedJobSlot> activeSlotOpt = pinnedJobSlotRepository.findByJobIdAndIsActiveTrue(job.getId());
            if (activeSlotOpt.isEmpty()) {
                PinnedJobSlot slot = new PinnedJobSlot();
                slot.setJobId(job.getId());
                slot.setEmployerId(job.getPostedById());
                
                PaymentType durationType = PaymentType.PINNED_JOB_3DAYS;
                if (job.getPinnedPaymentId() != null && paymentRepository.existsById(job.getPinnedPaymentId())) {
                    slot.setPaymentId(job.getPinnedPaymentId());
                    paymentRepository.findById(job.getPinnedPaymentId()).ifPresent(p -> {
                        slot.setDurationType(p.getType());
                    });
                } else {
                    slot.setDurationType(durationType);
                }
                
                slot.setStartDate(LocalDateTime.now().minusDays(1));
                slot.setEndDate(job.getPinnedUntil());
                slot.setActive(true);
                slot.setOverriddenByAdmin(false);
                
                pinnedJobSlotRepository.save(slot);
                log.info("Self-healed active pinned job slot for job '{}'", job.getTitle());
            }
        }
    }

    public Page<PinnedJobSlotResponse> getActiveSlots(Pageable pageable) {
        syncPinnedSlots();
        return pinnedJobSlotRepository.findAll(pageable)
                .map(this::mapToResponse);
    }

    public Page<PastPinnedJobSlotResponse> getPastSlots(Pageable pageable) {
        syncPinnedSlots();
        return pinnedJobSlotRepository.findAllByIsActiveFalseAndOverriddenByAdminFalseOrderByEndDateDesc(pageable)
                .map(this::mapToPastResponse);
    }

    public List<PastPinnedJobSlotResponse> getPastSlotsForExport() {
        syncPinnedSlots();
        return pinnedJobSlotRepository.findAllByIsActiveFalseAndOverriddenByAdminFalseOrderByEndDateDesc()
                .stream()
                .map(this::mapToPastResponse)
                .toList();
    }

    @Transactional
    public PinnedJobSlotResponse adminOverride(UUID adminId, UUID slotId, AdminOverrideJobSlotRequest request) {
        PinnedJobSlot slot = pinnedJobSlotRepository.findById(slotId)
                .orElseThrow(() -> new RuntimeException("PinnedJobSlot not found"));

        if (!slot.isActive()) {
            throw new RuntimeException("Slot is not currently active");
        }

        slot.setActive(false);
        slot.setOverriddenByAdmin(true);
        pinnedJobSlotRepository.save(slot);

        // Update the JobPost
        JobPost job = jobPostRepository.findById(slot.getJobId()).orElse(null);
        if (job != null) {
            job.setPinned(false);
            job.setPinnedUntil(null);
            job.setPinnedPaymentId(null);
            jobPostRepository.save(job);
        }

        // Audit log
        AdminAction action = new AdminAction();
        action.setAdminId(adminId);
        action.setActionType(AdminActionTypes.REMOVE_JOB_ADVERTISEMENT);
        action.setTargetType("JOB_ADVERTISEMENT_SLOT");
        action.setTargetId(slot.getId());
        action.setNotes(request.reason());
        action.setOutcome("OVERRIDDEN");
        adminActionRepository.save(action);

        User employer = userRepository.findById(slot.getEmployerId()).orElse(null);
        if (employer != null && job != null) {
            notificationService.notify(
                    employer.getId(),
                    NotificationCategory.PINNED_JOB,
                    "Job Advertisement Removed",
                    "Your job advertisement for '" + job.getTitle() + "' was removed by an admin. Reason: " + request.reason(),
                    null
            );
            emailService.sendJobAdvertisementOverriddenEmail(employer.getEmail(), employer.getFullName(), job.getTitle(), request.reason());
        }

        return mapToResponse(slot);
    }

    @Scheduled(fixedRate = 60000)
    @Transactional
    public void expireSlots() {
        List<PinnedJobSlot> expiredSlots = pinnedJobSlotRepository
                .findAllByIsActiveTrueAndEndDateBefore(LocalDateTime.now());

        if (!expiredSlots.isEmpty()) {
            for (PinnedJobSlot slot : expiredSlots) {
                slot.setActive(false);
                
                JobPost job = jobPostRepository.findById(slot.getJobId()).orElse(null);
                if (job != null) {
                    job.setPinned(false);
                    job.setPinnedUntil(null);
                    job.setPinnedPaymentId(null);
                    jobPostRepository.save(job);
                    
                    User employer = userRepository.findById(slot.getEmployerId()).orElse(null);
                    if (employer != null) {
                        notificationService.notify(
                                employer.getId(),
                                NotificationCategory.PINNED_JOB,
                                "Job Advertisement Ended",
                                "Your job advertisement for '" + job.getTitle() + "' has ended.",
                                null
                        );
                        emailService.sendJobAdvertisementExpiredEmail(employer.getEmail(), employer.getFullName(), job.getTitle());
                    }
                }
            }
            pinnedJobSlotRepository.saveAll(expiredSlots);
            log.info("Expired {} job advertisement slots", expiredSlots.size());
        }
    }

    private PinnedJobSlotResponse mapToResponse(PinnedJobSlot slot) {
        JobPost job = jobPostRepository.findById(slot.getJobId()).orElse(null);
        User employer = userRepository.findById(slot.getEmployerId()).orElse(null);
        
        return new PinnedJobSlotResponse(
                slot.getId(),
                slot.getJobId(),
                job != null ? job.getTitle() : "Unknown Job",
                slot.getEmployerId(),
                employer != null ? employer.getFullName() : "Unknown Employer",
                slot.getDurationType(),
                slot.getStartDate(),
                slot.getEndDate(),
                slot.isActive(),
                slot.isOverriddenByAdmin(),
                slot.getPaymentId(),
                slot.getCreatedAt()
        );
    }

    private PastPinnedJobSlotResponse mapToPastResponse(PinnedJobSlot slot) {
        JobPost job = jobPostRepository.findById(slot.getJobId()).orElse(null);
        User employer = userRepository.findById(slot.getEmployerId()).orElse(null);

        return new PastPinnedJobSlotResponse(
                slot.getId(),
                slot.getJobId(),
                job != null ? job.getTitle() : "Unknown Job",
                slot.getEmployerId(),
                employer != null ? employer.getFullName() : "Unknown Employer",
                slot.getDurationType(),
                slot.getStartDate(),
                slot.getEndDate()
        );
    }
}
