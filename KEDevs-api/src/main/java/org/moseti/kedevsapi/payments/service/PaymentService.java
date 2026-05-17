package org.moseti.kedevsapi.payments.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.moseti.kedevsapi.jobs.entity.JobPost;
import org.moseti.kedevsapi.jobs.repository.JobPostRepository;
import org.moseti.kedevsapi.payments.dto.PaymentDtos.*;
import org.moseti.kedevsapi.payments.entity.Payment;
import org.moseti.kedevsapi.payments.exception.*;
import org.moseti.kedevsapi.payments.repository.*;
import org.moseti.kedevsapi.shared.enums.*;
import org.moseti.kedevsapi.shared.exception.BadRequestException;
import org.moseti.kedevsapi.shared.exception.ForbiddenException;
import org.moseti.kedevsapi.shared.exception.ResourceNotFoundException;
import org.moseti.kedevsapi.shared.util.Constants;
import org.moseti.kedevsapi.users.entity.User;
import org.moseti.kedevsapi.users.entity.VerificationRequest;
import org.moseti.kedevsapi.users.repository.DeveloperProfileRepository;
import org.moseti.kedevsapi.users.repository.EmployerProfileRepository;
import org.moseti.kedevsapi.users.repository.UserRepository;
import org.moseti.kedevsapi.users.repository.VerificationRequestRepository;
import org.moseti.kedevsapi.spotlight.entity.SpotlightSlot;
import org.moseti.kedevsapi.spotlight.service.SpotlightService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.moseti.kedevsapi.shared.dto.WebSocketEvent;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final DarajaService darajaService;
    private final PaymentRepository paymentRepository;
    private final PlatformSettingRepository platformSettingRepository;
    private final org.moseti.kedevsapi.spotlight.repository.SpotlightSlotRepository spotlightSlotRepository;
    private final UserRepository userRepository;
    private final DeveloperProfileRepository developerProfileRepository;
    private final EmployerProfileRepository employerProfileRepository;
    private final SpotlightService spotlightService;
    private final org.moseti.kedevsapi.notifications.service.NotificationService notificationService;
    private final org.moseti.kedevsapi.auth.service.EmailService emailService;
    private final VerificationRequestRepository verificationRequestRepository;
    private final JobPostRepository jobPostRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;
    private final org.moseti.kedevsapi.jobs.service.PinnedJobSlotService pinnedJobSlotService;

    // ====================== Helper ======================

    private BigDecimal getSettingValue(String key) {
        return platformSettingRepository.findBySettingKey(key)
                .map(s -> new BigDecimal(s.getSettingValue()))
                .orElseGet(() -> getDefaultFallback(key));
    }

    private BigDecimal getDefaultFallback(String key) {
        return switch (key) {
            case "VERIFIED_BADGE_DEVELOPER" -> BigDecimal.valueOf(Constants.DEFAULT_VERIFIED_BADGE_DEVELOPER);
            case "VERIFIED_BADGE_EMPLOYER"  -> BigDecimal.valueOf(Constants.DEFAULT_VERIFIED_BADGE_EMPLOYER);
            case "SPOTLIGHT_DAY_FEE"        -> BigDecimal.valueOf(Constants.DEFAULT_SPOTLIGHT_DAY_FEE);
            case "SPOTLIGHT_WEEK_FEE"       -> BigDecimal.valueOf(Constants.DEFAULT_SPOTLIGHT_WEEK_FEE);
            case "PINNED_JOB_DAY_FEE"       -> BigDecimal.valueOf(Constants.DEFAULT_PINNED_JOB_DAY_FEE);
            case "PINNED_JOB_3DAYS_FEE"     -> BigDecimal.valueOf(Constants.DEFAULT_PINNED_JOB_3DAYS_FEE);
            case "PINNED_JOB_7DAYS_FEE"     -> BigDecimal.valueOf(Constants.DEFAULT_PINNED_JOB_7DAYS_FEE);
            default -> BigDecimal.ZERO;
        };
    }

    private User getUser(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new BadRequestException("User not found: " + userId));
    }

    private Payment buildAndSavePayment(UUID userId, PaymentType type, BigDecimal amount,
                                        String phoneNumber, String checkoutRequestId, String metadata) {
        Payment payment = new Payment();
        payment.setUserId(userId);
        payment.setType(type);
        payment.setAmount(amount);
        payment.setPhoneNumber(phoneNumber);
        payment.setStatus(PaymentStatus.PENDING);
        payment.setMpesaCheckoutId(checkoutRequestId);
        payment.setMetadata(metadata);
        return paymentRepository.save(payment);
    }

    // ====================== Initiation Methods ======================

    @Transactional
    public PaymentInitiationResponse initiateVerifiedBadge(UUID userId, String phoneNumber) {
        User user = getUser(userId);
        boolean alreadyVerified = false;

        if (user.getRole() == Role.DEVELOPER) {
            alreadyVerified = developerProfileRepository.findByUserId(userId)
                    .map(p -> p.isVerified())
                    .orElse(false);
            if (alreadyVerified) throw new AlreadyVerifiedException("Developer profile is already verified");
        } else if (user.getRole() == Role.EMPLOYER) {
            alreadyVerified = employerProfileRepository.findByUserId(userId)
                    .map(p -> p.isVerified())
                    .orElse(false);
            if (alreadyVerified) throw new AlreadyVerifiedException("Employer profile is already verified");
        }

        String feeKey = user.getRole() == Role.DEVELOPER ? "VERIFIED_BADGE_DEVELOPER" : "VERIFIED_BADGE_EMPLOYER";
        BigDecimal amount = getSettingValue(feeKey);

        // Save PENDING payment before initiating STK push
        Payment payment = buildAndSavePayment(userId, PaymentType.VERIFIED_BADGE, amount,
                phoneNumber, null, null);

        try {
            StkPushResponse stkResponse = darajaService.initiateSTKPush(
                    phoneNumber, amount, "KEDevsVerify", "Verified Badge");

            payment.setMpesaCheckoutId(stkResponse.checkoutRequestId());
            paymentRepository.save(payment);

            return new PaymentInitiationResponse(stkResponse.checkoutRequestId(),
                    "STK push sent. Enter your M-Pesa PIN to complete payment.", amount);
        } catch (Exception e) {
            log.error("STK push failed for verified badge {}: {}", payment.getId(), e.getMessage());
            payment.setStatus(PaymentStatus.FAILED);
            payment.setFailReason(e.getMessage());
            paymentRepository.save(payment);
            throw e;
        }
    }

    @Transactional
    public PaymentInitiationResponse initiateSpotlight(UUID userId, String phoneNumber, SpotlightType spotlightType) {
        User user = getUser(userId);
        if (user.getRole() != Role.DEVELOPER) {
            throw new ForbiddenException("Only developers can purchase spotlight slots");
        }

        if (!spotlightService.checkSlotAvailability().daySlotAvailable() && spotlightType == SpotlightType.DAY) {
            throw new SpotlightSlotTakenException("A developer is currently featured in this spotlight. Please try again later.");
        }
        if (!spotlightService.checkSlotAvailability().weekSlotAvailable() && spotlightType == SpotlightType.WEEK) {
            throw new SpotlightSlotTakenException("A developer is currently featured in this spotlight. Please try again later.");
        }

        String feeKey = spotlightType == SpotlightType.DAY ? "SPOTLIGHT_DAY_FEE" : "SPOTLIGHT_WEEK_FEE";
        BigDecimal amount = getSettingValue(feeKey);
        PaymentType type = spotlightType == SpotlightType.DAY ? PaymentType.SPOTLIGHT_DAY : PaymentType.SPOTLIGHT_WEEK;

        // Save PENDING payment before initiating STK push
        Payment payment = buildAndSavePayment(userId, type, amount, phoneNumber, null,
                "{\"spotlightType\":\"" + spotlightType.name() + "\"}");

        try {
            StkPushResponse stkResponse = darajaService.initiateSTKPush(
                    phoneNumber, amount, "KEDevsSpotlt", "Spotlight " + spotlightType.name());

            payment.setMpesaCheckoutId(stkResponse.checkoutRequestId());
            paymentRepository.save(payment);

            // Create the slot INACTIVE — it will be activated only after Daraja confirms payment
            spotlightService.createInactiveSlot(userId, payment.getId(), spotlightType);

            return new PaymentInitiationResponse(stkResponse.checkoutRequestId(),
                    "STK push sent. Enter your M-Pesa PIN to complete payment.", amount);
        } catch (Exception e) {
            log.error("STK push failed for spotlight {}: {}", payment.getId(), e.getMessage());
            payment.setStatus(PaymentStatus.FAILED);
            payment.setFailReason(e.getMessage());
            paymentRepository.save(payment);
            throw e;
        }
    }


    @Transactional
    public PaymentInitiationResponse initiatePinnedJob(UUID userId, UUID jobId, String durationType, String phoneNumber) {
        getUser(userId);

        JobPost job = jobPostRepository.findById(jobId)
                .orElseThrow(() -> new BadRequestException("Job post not found: " + jobId));

        if (!job.getPostedById().equals(userId)) {
            throw new ForbiddenException("You can only pin your own job posts");
        }
        if (job.isPeerSourced()) {
            throw new BadRequestException("Peer-sourced job posts cannot be pinned");
        }
        if (job.isPinned()) {
            throw new BadRequestException("This job is already pinned until " + job.getPinnedUntil());
        }

        // Hard cap: no more than 3 pinned jobs at once
        long activePinnedCount = jobPostRepository
                .findByIsPinnedTrueAndPinnedUntilAfterOrderByPinnedUntilDesc(LocalDateTime.now())
                .stream()
                .filter(j -> j.getStatus() == org.moseti.kedevsapi.shared.enums.JobStatus.OPEN)
                .count();
        if (activePinnedCount >= 3) {
            throw new BadRequestException("All 3 pinned job slots are currently occupied. Please try again later.");
        }

        String feeKey;
        PaymentType type;
        switch (durationType.toUpperCase()) {
            case "DAY" -> {
                feeKey = "PINNED_JOB_DAY_FEE";
                type = PaymentType.PINNED_JOB_DAY;
            }
            case "3DAYS" -> {
                feeKey = "PINNED_JOB_3DAYS_FEE";
                type = PaymentType.PINNED_JOB_3DAYS;
            }
            case "7DAYS" -> {
                feeKey = "PINNED_JOB_7DAYS_FEE";
                type = PaymentType.PINNED_JOB_7DAYS;
            }
            default -> throw new BadRequestException("Invalid duration type. Use: DAY, 3DAYS, or 7DAYS");
        }

        BigDecimal amount = getSettingValue(feeKey);

        // Save PENDING payment before initiating STK push so it's registered even if push fails
        Payment payment = buildAndSavePayment(userId, type, amount, phoneNumber, null,
                "{\"jobId\":\"" + jobId + "\",\"durationType\":\"" + durationType + "\"}");

        try {
            StkPushResponse stkResponse = darajaService.initiateSTKPush(
                    phoneNumber, amount, "KEDevsPinJob", "Pinned Job " + durationType);

            payment.setMpesaCheckoutId(stkResponse.checkoutRequestId());
            paymentRepository.save(payment);

            pinnedJobSlotService.createInactiveSlot(jobId, userId, payment.getId(), type);

            return new PaymentInitiationResponse(stkResponse.checkoutRequestId(),
                    "STK push sent. Enter your M-Pesa PIN to complete payment.", amount);
        } catch (Exception e) {
            log.error("STK push failed for payment {}: {}", payment.getId(), e.getMessage());
            payment.setStatus(PaymentStatus.FAILED);
            payment.setFailReason(e.getMessage());
            paymentRepository.save(payment);
            throw e;
        }
    }

    // ====================== Callback ======================

    @Transactional
    public void handleCallback(DarajaCallbackRequest callback) {
        if (callback.body() == null || callback.body().stkCallback() == null) {
            log.warn("Received malformed Daraja callback");
            return;
        }

        DarajaCallbackRequest.StkCallback stkCallback = callback.body().stkCallback();
        String checkoutRequestId = stkCallback.checkoutRequestId();

        Payment payment = paymentRepository.findByMpesaCheckoutId(checkoutRequestId).orElse(null);
        if (payment == null) {
            log.warn("Received callback for unknown checkoutRequestId: {}", checkoutRequestId);
            return;
        }

        // Idempotency: skip if already in a terminal state (except manual-confirmed payments)
        if ((payment.getStatus() == PaymentStatus.COMPLETED || payment.getStatus() == PaymentStatus.FAILED || payment.getStatus() == PaymentStatus.CANCELLED)
            && payment.getMpesaReceiptNo() != null && !payment.getMpesaReceiptNo().startsWith("MANUAL-")) {
            log.info("Payment {} already processed ({}), skipping callback", payment.getId(), payment.getStatus());
            return;
        }

        if (stkCallback.resultCode() == 0) {
            if (stkCallback.callbackMetadata() != null && stkCallback.callbackMetadata().item() != null) {
                for (DarajaCallbackRequest.CallbackItem item : stkCallback.callbackMetadata().item()) {
                    if (item.value() == null) continue;
                    switch (item.name()) {
                        case "Amount"            -> payment.setAmount(new java.math.BigDecimal(item.value().toString()));
                        case "MpesaReceiptNumber"-> payment.setMpesaReceiptNo(item.value().toString());
                        case "TransactionDate"   -> {
                            try {
                                payment.setPaidAt(parseMpesaDate(item.value().toString()));
                            } catch (Exception e) {
                                log.warn("Could not parse TransactionDate: {}", item.value());
                                payment.setPaidAt(LocalDateTime.now());
                            }
                        }
                        case "PhoneNumber"       -> payment.setPhoneNumber(item.value().toString());
                    }
                }
            }
            payment.setStatus(PaymentStatus.COMPLETED);
            paymentRepository.save(payment);
            processSuccessfulPayment(payment);

            messagingTemplate.convertAndSendToUser(
                payment.getUserId().toString(),
                "/queue/status",
                new WebSocketEvent<>("PAYMENT_COMPLETED", Map.of(
                    "paymentId", payment.getId(),
                    "type", payment.getType()
                ))
            );
        } else {
            int resultCode = stkCallback.resultCode();
            String resultDesc = stkCallback.resultDesc() != null ? stkCallback.resultDesc() : "Payment failed";
            // ResultCode 1032 = user cancelled; all others are failures
            PaymentStatus failStatus = (resultCode == 1032) ? PaymentStatus.CANCELLED : PaymentStatus.FAILED;

            log.warn("Payment {} {} with ResultCode {}: {}", payment.getId(), failStatus, resultCode, resultDesc);

            payment.setStatus(failStatus);
            payment.setFailReason(resultDesc);
            paymentRepository.save(payment);

            // If this was a verification payment, update the VerificationRequest so the poller can stop
            if (payment.getType() == PaymentType.VERIFIED_BADGE) {
                verificationRequestRepository.findByUserId(payment.getUserId()).ifPresent(req -> {
                    req.setStatus(VerificationStatus.REJECTED);
                    req.setRejectionReason(resultCode == 1032 ? "Payment cancelled by user" : resultDesc);
                    verificationRequestRepository.save(req);
                });
            }

            // Clean up inactive spotlight slot (only on definitive FAILED or CANCELLED, not retries)
            if (payment.getType() == PaymentType.SPOTLIGHT_DAY || payment.getType() == PaymentType.SPOTLIGHT_WEEK) {
                spotlightService.deleteInactiveSlotByPaymentId(payment.getId());
            } else if (payment.getType() == PaymentType.PINNED_JOB_DAY || payment.getType() == PaymentType.PINNED_JOB_3DAYS || payment.getType() == PaymentType.PINNED_JOB_7DAYS) {
                pinnedJobSlotService.deleteInactiveSlotByPaymentId(payment.getId());
            }

            messagingTemplate.convertAndSendToUser(
                payment.getUserId().toString(),
                "/queue/status",
                new WebSocketEvent<>("PAYMENT_FAILED", Map.of(
                    "paymentId", payment.getId(),
                    "type", payment.getType(),
                    "reason", resultDesc
                ))
            );
        }
    }

    private LocalDateTime parseMpesaDate(String mpesaDate) {
        java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
        return LocalDateTime.parse(mpesaDate, formatter);
    }

    private void processSuccessfulPayment(Payment payment) {
        switch (payment.getType()) {
            case VERIFIED_BADGE -> {
                verificationRequestRepository.findByUserId(payment.getUserId()).ifPresent(request -> {
                    request.setStatus(VerificationStatus.PENDING_DOCS);
                    request.setPaymentId(payment.getId());
                    verificationRequestRepository.save(request);
                });

                User user = userRepository.findById(payment.getUserId()).orElse(null);
                if (user != null) {
                    NotificationCategory category = user.getRole() == Role.EMPLOYER
                            ? NotificationCategory.EMPLOYER_VERIFICATION_PAYMENT_SUCCESS
                            : NotificationCategory.PAYMENT;
                    notificationService.notify(
                            payment.getUserId(),
                            category,
                            "Payment Confirmed",
                            "Your verification payment of KES " + payment.getAmount() + " has been confirmed. Please upload your documents to continue.",
                            "{\"receiptNo\":\"" + payment.getMpesaReceiptNo() + "\"}"
                    );
                    emailService.sendPaymentConfirmationEmail(user.getEmail(), user.getFullName(), "Verified Badge Review Fee", payment.getAmount(), payment.getMpesaReceiptNo());
                }
                messagingTemplate.convertAndSendToUser(
                    payment.getUserId().toString(),
                    "/queue/status",
                    new WebSocketEvent<>("STATUS_UPDATE", Map.of("verificationStatus", VerificationStatus.PENDING_DOCS))
                );
            }
            case SPOTLIGHT_DAY, SPOTLIGHT_WEEK -> {
                // Activate the pre-created inactive slot
                spotlightService.activateExistingSlot(payment.getId());

                User user = userRepository.findById(payment.getUserId()).orElse(null);
                if (user != null) {
                    SpotlightType spotlightType = payment.getType() == PaymentType.SPOTLIGHT_DAY
                            ? SpotlightType.DAY : SpotlightType.WEEK;
                    notificationService.notify(
                            payment.getUserId(),
                            NotificationCategory.SPOTLIGHT,
                            "Spotlight Activated!",
                            "Your " + spotlightType.name() + " spotlight is now live.",
                            null
                    );
                    emailService.sendPaymentConfirmationEmail(user.getEmail(), user.getFullName(),
                            "Spotlight " + spotlightType.name(), payment.getAmount(), payment.getMpesaReceiptNo());
                }
            }
            case PINNED_JOB_DAY, PINNED_JOB_3DAYS, PINNED_JOB_7DAYS -> {
                activatePinnedJob(payment);
            }
            default -> log.warn("Unhandled payment type in processSuccessfulPayment: {}", payment.getType());
        }
    }

    private void activatePinnedJob(Payment payment) {
        if (payment.getMetadata() == null) {
            log.warn("Missing metadata on pinned job payment {}", payment.getId());
            return;
        }

        // Parse jobId from metadata JSON using ObjectMapper
        String meta = payment.getMetadata();
        UUID jobId;
        try {
            Map<String, Object> metadataMap = objectMapper.readValue(meta, Map.class);
            String jobIdStr = (String) metadataMap.get("jobId");
            if (jobIdStr == null || jobIdStr.isBlank()) {
                log.error("jobId is missing or empty in metadata: {}", meta);
                return;
            }
            jobId = UUID.fromString(jobIdStr);
        } catch (Exception e) {
            log.error("Could not parse metadata JSON: {}", meta, e);
            return;
        }

        JobPost job = jobPostRepository.findById(jobId).orElse(null);
        if (job == null) {
            log.warn("Job not found for pinned job payment {}", payment.getId());
            return;
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime pinnedUntil = switch (payment.getType()) {
            case PINNED_JOB_DAY   -> now.plusDays(1);
            case PINNED_JOB_3DAYS -> now.plusDays(3);
            case PINNED_JOB_7DAYS -> now.plusDays(7);
            default               -> now.plusDays(1);
        };

        pinnedJobSlotService.activateExistingSlot(payment.getId(), job);

        User user = userRepository.findById(payment.getUserId()).orElse(null);
        if (user != null) {
            String dateStr = job.getPinnedUntil().toLocalDate().toString();
            notificationService.notify(
                    payment.getUserId(),
                    NotificationCategory.PINNED_JOB,
                    "Job Pinned",
                    "Your job '" + job.getTitle() + "' is now pinned until " + dateStr + ".",
                    "{\"jobId\":\"" + job.getId() + "\"}"
            );
            emailService.sendPaymentConfirmationEmail(user.getEmail(), user.getFullName(),
                    "Pinned Job Post", payment.getAmount(), payment.getMpesaReceiptNo());
        }

        messagingTemplate.convertAndSendToUser(
            payment.getUserId().toString(),
            "/queue/status",
            new WebSocketEvent<>("STATUS_UPDATE", Map.of(
                "jobId", job.getId(),
                "isPinned", true,
                "pinnedUntil", job.getPinnedUntil().toString()
            ))
        );
    }

    // ====================== Dev Utility ======================

    /**
     * Manually confirm a pending spotlight payment.
     * Used in development when Daraja callback URL isn't publicly reachable.
     */
    @Transactional
    public SpotlightSlotConfirmResponse confirmSpotlight(UUID userId) {
        Payment payment = paymentRepository.findFirstByUserIdAndTypeInAndStatusInOrderByCreatedAtDesc(
                userId,
                List.of(PaymentType.SPOTLIGHT_DAY, PaymentType.SPOTLIGHT_WEEK),
                List.of(PaymentStatus.COMPLETED, PaymentStatus.PENDING, PaymentStatus.FAILED, PaymentStatus.CANCELLED)
        ).orElseThrow(() -> new BadRequestException(
                "No spotlight payment record found."));

        if (payment.getStatus() == PaymentStatus.PENDING) {
            throw new BadRequestException("Payment is still processing. Please wait for the M-Pesa confirmation.");
        }
        
        if (payment.getStatus() == PaymentStatus.FAILED || payment.getStatus() == PaymentStatus.CANCELLED) {
            throw new BadRequestException("Payment was not successful (" + payment.getStatus() + "). Reason: " + payment.getFailReason());
        }

        SpotlightSlot slot = spotlightSlotRepository.findByPaymentId(payment.getId()).orElse(null);
        if (slot == null || !slot.isActive()) {
            // If payment is completed but slot is not active for some reason, try to activate it
            SpotlightType type = payment.getType() == PaymentType.SPOTLIGHT_DAY ? SpotlightType.DAY : SpotlightType.WEEK;
            slot = spotlightService.activateSpotlight(userId, payment.getId(), type);
        }

        return new SpotlightSlotConfirmResponse(slot.getId(), slot.getType(), slot.getEndDate());
    }

    /**
     * Administrative override to manually activate a spotlight slot.
     */
    @Transactional
    public SpotlightSlotConfirmResponse adminConfirmSpotlight(UUID userId) {
        Payment payment = paymentRepository.findFirstByUserIdAndTypeInAndStatusInOrderByCreatedAtDesc(
                userId,
                List.of(PaymentType.SPOTLIGHT_DAY, PaymentType.SPOTLIGHT_WEEK),
                List.of(PaymentStatus.PENDING)
        ).orElseThrow(() -> new BadRequestException(
                "No pending spotlight payment found for manual override."));

        payment.setStatus(PaymentStatus.COMPLETED);
        payment.setPaidAt(LocalDateTime.now());
        payment.setMpesaReceiptNo("MANUAL-ADMIN-" + System.currentTimeMillis());
        paymentRepository.save(payment);

        SpotlightType type = payment.getType() == PaymentType.SPOTLIGHT_DAY
                ? SpotlightType.DAY : SpotlightType.WEEK;
        SpotlightSlot slot = spotlightService.activateSpotlight(userId, payment.getId(), type);

        return new SpotlightSlotConfirmResponse(slot.getId(), type, slot.getEndDate());
    }

    /**
     * Manually confirm a pending pinned-job payment.
     * Used in development when Daraja callback URL isn't publicly reachable.
     */
    @Transactional
    public void confirmPinnedJob(UUID userId) {
        Payment payment = paymentRepository.findFirstByUserIdAndTypeInAndStatusInOrderByCreatedAtDesc(
                userId,
                List.of(PaymentType.PINNED_JOB_DAY, PaymentType.PINNED_JOB_3DAYS, PaymentType.PINNED_JOB_7DAYS),
                List.of(PaymentStatus.PENDING)
        ).orElseThrow(() -> new BadRequestException(
                "No pending pinned job payment found. Please initiate a new payment."));

        payment.setStatus(PaymentStatus.COMPLETED);
        payment.setPaidAt(LocalDateTime.now());
        payment.setMpesaReceiptNo("MANUAL-" + System.currentTimeMillis());
        paymentRepository.save(payment);

        activatePinnedJob(payment);
    }

    // ====================== Query Methods ======================

    public Page<PaymentResponse> getPaymentHistory(UUID userId, Pageable pageable) {
        return paymentRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(p -> new PaymentResponse(
                        p.getId(), p.getType(), p.getAmount(), p.getCurrency(),
                        p.getStatus(), p.getMpesaReceiptNo(), p.getFailReason(),
                        p.getPhoneNumber(), p.getPaidAt(), p.getCreatedAt()
                ));
    }

    public Page<PaymentResponse> getAllPayments(int page, int size, PaymentStatus status) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(
                page, size, org.springframework.data.domain.Sort.by("createdAt").descending());
        Page<Payment> payments = (status != null)
                ? paymentRepository.findByStatus(status, pageable)
                : paymentRepository.findAll(pageable);
        return payments.map(p -> new PaymentResponse(
                p.getId(), p.getType(), p.getAmount(), p.getCurrency(),
                p.getStatus(), p.getMpesaReceiptNo(), p.getFailReason(),
                p.getPhoneNumber(), p.getPaidAt(), p.getCreatedAt()
        ));
    }

    public List<Payment> findByUserIdOrderByCreatedAtDesc(UUID userId) {
        return paymentRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<PlatformSettingResponse> getPlatformSettings() {
        return platformSettingRepository.findAll().stream()
                .map(s -> new PlatformSettingResponse(s.getSettingKey(), s.getSettingValue(), s.getDescription()))
                .toList();
    }

    public PaymentResponse getPaymentStatusByCheckoutId(UUID userId, String checkoutRequestId) {
        Payment payment = paymentRepository.findByMpesaCheckoutId(checkoutRequestId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for checkout ID"));
        
        if (!payment.getUserId().equals(userId)) {
            throw new ForbiddenException("Not authorized to view this payment");
        }

        return new PaymentResponse(
                payment.getId(), payment.getType(), payment.getAmount(), payment.getCurrency(),
                payment.getStatus(), payment.getMpesaReceiptNo(), payment.getFailReason(),
                payment.getPhoneNumber(), payment.getPaidAt(), payment.getCreatedAt()
        );
    }

    /**
     * Returns true if the given user has a COMPLETED VERIFIED_BADGE payment.
     * Used to gate employer document uploads during onboarding.
     */
    public boolean hasCompletedVerifiedBadgePayment(UUID userId) {
        return paymentRepository.existsByUserIdAndTypeAndStatus(
                userId, PaymentType.VERIFIED_BADGE, PaymentStatus.COMPLETED);
    }

    // ====================== Private Helpers ======================

    /** Fallback — returns an empty string when phone number is not in scope. */
    private String phoneNumber(UUID userId) {
        return "";
    }
}
