package org.moseti.kedevsapi.payments.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.moseti.kedevsapi.payments.dto.PaymentDtos.*;
import org.moseti.kedevsapi.payments.entity.Payment;
import org.moseti.kedevsapi.payments.entity.SearchToken;
import org.moseti.kedevsapi.payments.entity.Subscription;
import org.moseti.kedevsapi.payments.exception.*;
import org.moseti.kedevsapi.payments.repository.*;
import org.moseti.kedevsapi.shared.enums.*;
import org.moseti.kedevsapi.shared.exception.BadRequestException;
import org.moseti.kedevsapi.shared.exception.ForbiddenException;
import org.moseti.kedevsapi.shared.util.Constants;
import org.moseti.kedevsapi.users.entity.User;
import org.moseti.kedevsapi.users.repository.DeveloperProfileRepository;
import org.moseti.kedevsapi.users.repository.EmployerProfileRepository;
import org.moseti.kedevsapi.users.repository.UserRepository;
import org.moseti.kedevsapi.spotlight.service.SpotlightService;
import org.moseti.kedevsapi.users.repository.VerificationRequestRepository;
import org.moseti.kedevsapi.users.entity.VerificationRequest;
import org.moseti.kedevsapi.spotlight.entity.SpotlightSlot;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.moseti.kedevsapi.shared.dto.WebSocketEvent;
import java.util.Map;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final DarajaService darajaService;
    private final PaymentRepository paymentRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final SearchTokenRepository searchTokenRepository;
    private final PlatformSettingRepository platformSettingRepository;
    private final UserRepository userRepository;
    private final DeveloperProfileRepository developerProfileRepository;
    private final EmployerProfileRepository employerProfileRepository;
    private final SpotlightService spotlightService;
    private final org.moseti.kedevsapi.notifications.service.NotificationService notificationService;
    private final org.moseti.kedevsapi.auth.service.EmailService emailService;
    private final VerificationRequestRepository verificationRequestRepository;
    private final SimpMessagingTemplate messagingTemplate;

    // ====================== Helper ======================

    private BigDecimal getSettingValue(String key) {
        return platformSettingRepository.findBySettingKey(key)
                .map(s -> new BigDecimal(s.getSettingValue()))
                .orElseGet(() -> getDefaultFallback(key));
    }

    private BigDecimal getDefaultFallback(String key) {
        return switch (key) {
            case "ANNUAL_FEE_DEVELOPER" -> BigDecimal.valueOf(Constants.DEFAULT_DEVELOPER_ANNUAL_FEE);
            case "ANNUAL_FEE_EMPLOYER" -> BigDecimal.valueOf(Constants.DEFAULT_EMPLOYER_ANNUAL_FEE);
            case "EMPLOYER_PRO_ANNUAL_FEE" -> BigDecimal.valueOf(Constants.DEFAULT_EMPLOYER_PRO_ANNUAL_FEE);
            case "VERIFIED_BADGE_DEVELOPER" -> BigDecimal.valueOf(Constants.DEFAULT_VERIFIED_BADGE_DEVELOPER);
            case "VERIFIED_BADGE_EMPLOYER" -> BigDecimal.valueOf(Constants.DEFAULT_VERIFIED_BADGE_EMPLOYER);
            case "SPOTLIGHT_DAY_FEE" -> BigDecimal.valueOf(Constants.DEFAULT_SPOTLIGHT_DAY_FEE);
            case "SPOTLIGHT_WEEK_FEE" -> BigDecimal.valueOf(Constants.DEFAULT_SPOTLIGHT_WEEK_FEE);
            case "SEARCH_TOKEN_FEE" -> BigDecimal.valueOf(Constants.DEFAULT_SEARCH_TOKEN_FEE);
            case "SEARCH_TOKEN_USES" -> BigDecimal.valueOf(Constants.DEFAULT_SEARCH_TOKEN_USES);
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
    public PaymentInitiationResponse initiateAnnualMembership(UUID userId, String phoneNumber) {
        User user = getUser(userId);
        if (subscriptionRepository.existsByUserIdAndTypeAndStatus(
                userId, SubscriptionType.ANNUAL_MEMBERSHIP, SubscriptionStatus.ACTIVE)) {
            throw new AlreadySubscribedException("You already have an active membership");
        }
        String feeKey = user.getRole() == Role.DEVELOPER ? "ANNUAL_FEE_DEVELOPER" : "ANNUAL_FEE_EMPLOYER";
        BigDecimal amount = getSettingValue(feeKey);

        StkPushResponse stkResponse = darajaService.initiateSTKPush(
                phoneNumber, amount, "KEDevsMembr", "Annual Membership");

        buildAndSavePayment(userId, PaymentType.ANNUAL_MEMBERSHIP, amount,
                phoneNumber, stkResponse.checkoutRequestId(), null);

        return new PaymentInitiationResponse(stkResponse.checkoutRequestId(),
                "STK push sent. Enter your M-Pesa PIN to complete payment.", amount);
    }

    @Transactional
    public PaymentInitiationResponse initiateProUpgrade(UUID userId, String phoneNumber) {
        User user = getUser(userId);
        if (user.getRole() != Role.EMPLOYER) {
            throw new ForbiddenException("Only employers can upgrade to Pro");
        }
        if (subscriptionRepository.existsByUserIdAndTypeAndStatus(
                userId, SubscriptionType.EMPLOYER_PRO, SubscriptionStatus.ACTIVE)) {
            throw new AlreadySubscribedException("You already have an active Pro subscription");
        }

        BigDecimal amount = getSettingValue("EMPLOYER_PRO_ANNUAL_FEE");
        StkPushResponse stkResponse = darajaService.initiateSTKPush(
                phoneNumber, amount, "KEDevsProUpgr", "Employer Pro");

        buildAndSavePayment(userId, PaymentType.EMPLOYER_PRO, amount,
                phoneNumber, stkResponse.checkoutRequestId(), null);

        return new PaymentInitiationResponse(stkResponse.checkoutRequestId(),
                "STK push sent. Enter your M-Pesa PIN to complete payment.", amount);
    }

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
        StkPushResponse stkResponse = darajaService.initiateSTKPush(
                phoneNumber, amount, "KEDevsVerBadge", "Verified Badge");

        buildAndSavePayment(userId, PaymentType.VERIFIED_BADGE, amount,
                phoneNumber, stkResponse.checkoutRequestId(), null);

        return new PaymentInitiationResponse(stkResponse.checkoutRequestId(),
                "STK push sent. Enter your M-Pesa PIN to complete payment.", amount);
    }

    @Transactional
    public PaymentInitiationResponse initiateSpotlight(UUID userId, String phoneNumber, SpotlightType spotlightType) {
        User user = getUser(userId);
        if (user.getRole() != Role.DEVELOPER) {
            throw new ForbiddenException("Only developers can purchase spotlight slots");
        }
        
        if (spotlightService.checkSlotAvailability().daySlotAvailable() == false && spotlightType == SpotlightType.DAY) {
            throw new SpotlightSlotTakenException("A developer is currently featured in this spotlight. Please try again later.");
        }
        if (spotlightService.checkSlotAvailability().weekSlotAvailable() == false && spotlightType == SpotlightType.WEEK) {
            throw new SpotlightSlotTakenException("A developer is currently featured in this spotlight. Please try again later.");
        }

        String feeKey = spotlightType == SpotlightType.DAY ? "SPOTLIGHT_DAY_FEE" : "SPOTLIGHT_WEEK_FEE";
        BigDecimal amount = getSettingValue(feeKey);
        PaymentType type = spotlightType == SpotlightType.DAY ? PaymentType.SPOTLIGHT_DAY : PaymentType.SPOTLIGHT_WEEK;
        StkPushResponse stkResponse = darajaService.initiateSTKPush(
                phoneNumber, amount, "KEDevsSpotlt", "Spotlight " + spotlightType.name());

        buildAndSavePayment(userId, type, amount, phoneNumber,
                stkResponse.checkoutRequestId(), "{\"spotlightType\":\"" + spotlightType.name() + "\"}");

        return new PaymentInitiationResponse(stkResponse.checkoutRequestId(),
                "STK push sent. Enter your M-Pesa PIN to complete payment.", amount);
    }

    @Transactional
    public PaymentInitiationResponse initiateSearchToken(UUID employerId, String phoneNumber) {
        User user = getUser(employerId);
        if (user.getRole() != Role.EMPLOYER) {
            throw new ForbiddenException("Only employers can purchase search tokens");
        }

        BigDecimal amount = getSettingValue("SEARCH_TOKEN_FEE");
        StkPushResponse stkResponse = darajaService.initiateSTKPush(
                phoneNumber, amount, "KEDevsSrchTkn", "Search Token");

        buildAndSavePayment(employerId, PaymentType.SEARCH_TOKEN, amount,
                phoneNumber, stkResponse.checkoutRequestId(), "{\"type\":\"searchToken\"}");

        return new PaymentInitiationResponse(stkResponse.checkoutRequestId(),
                "STK push sent. Enter your M-Pesa PIN to complete payment.", amount);
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

        // Idempotency: skip if already in a terminal state, UNLESS it's a manual confirmation we want to overwrite with Daraja real data
        if ((payment.getStatus() == PaymentStatus.COMPLETED || payment.getStatus() == PaymentStatus.FAILED || payment.getStatus() == PaymentStatus.CANCELLED) 
            && !payment.getMpesaReceiptNo().startsWith("MANUAL-")) {
            log.info("Payment {} already processed ({}), skipping callback", payment.getId(), payment.getStatus());
            return;
        }

        if (stkCallback.resultCode() == 0) {
            if (stkCallback.callbackMetadata() != null && stkCallback.callbackMetadata().item() != null) {
                for (DarajaCallbackRequest.CallbackItem item : stkCallback.callbackMetadata().item()) {
                    if (item.value() == null) continue;
                    switch (item.name()) {
                        case "Amount" -> payment.setAmount(new java.math.BigDecimal(item.value().toString()));
                        case "MpesaReceiptNumber" -> payment.setMpesaReceiptNo(item.value().toString());
                        case "TransactionDate" -> {
                            try {
                                payment.setPaidAt(parseMpesaDate(item.value().toString()));
                            } catch (Exception e) {
                                log.warn("Could not parse TransactionDate: {}", item.value());
                                payment.setPaidAt(LocalDateTime.now());
                            }
                        }
                        case "PhoneNumber" -> payment.setPhoneNumber(item.value().toString());
                    }
                }
            }
            payment.setStatus(PaymentStatus.COMPLETED);
            paymentRepository.save(payment);
            processSuccessfulPayment(payment);

            messagingTemplate.convertAndSendToUser(
                payment.getUserId().toString(),
                "/queue/status",
                new WebSocketEvent<>("PAYMENT_COMPLETED", Map.of("paymentId", payment.getId(), "type", payment.getType()))
            );
        } else {
            // Distinguish user cancellation (1032) from other failures
            int resultCode = stkCallback.resultCode();
            String resultDesc = stkCallback.resultDesc() != null ? stkCallback.resultDesc() : "Payment failed";
            PaymentStatus failStatus = (resultCode == 1032) ? PaymentStatus.CANCELLED : PaymentStatus.FAILED;

            log.warn("Payment {} {} with ResultCode {}: {}",
                    payment.getId(), failStatus, resultCode, resultDesc);

            payment.setStatus(failStatus);
            payment.setFailReason(resultDesc);
            paymentRepository.save(payment);

            messagingTemplate.convertAndSendToUser(
                payment.getUserId().toString(),
                "/queue/status",
                new WebSocketEvent<>("PAYMENT_FAILED", Map.of("paymentId", payment.getId(), "reason", resultDesc))
            );
        }
    }

    private LocalDateTime parseMpesaDate(String mpesaDate) {
        // Daraja TransactionDate format: yyyyMMddHHmmss  e.g. 20260512090300
        java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
        return LocalDateTime.parse(mpesaDate, formatter);
    }

    private void processSuccessfulPayment(Payment payment) {
        switch (payment.getType()) {
            case ANNUAL_MEMBERSHIP -> {
                LocalDateTime now = LocalDateTime.now();

                // Create or renew subscription
                Subscription sub = subscriptionRepository
                        .findByUserIdAndTypeAndStatus(payment.getUserId(),
                                SubscriptionType.ANNUAL_MEMBERSHIP, SubscriptionStatus.ACTIVE)
                        .orElse(null);

                LocalDateTime startDate;
                LocalDateTime endDate;

                if (sub != null) {
                    startDate = sub.getEndDate();
                    endDate = sub.getEndDate().plusYears(1);
                } else {
                    sub = new Subscription();
                    startDate = now;
                    endDate = now.plusYears(1);
                }

                sub.setUserId(payment.getUserId());
                sub.setType(SubscriptionType.ANNUAL_MEMBERSHIP);
                sub.setStatus(SubscriptionStatus.ACTIVE);
                sub.setStartDate(startDate);
                sub.setEndDate(endDate);
                sub.setAmountPaid(payment.getAmount());
                sub.setMpesaReceiptNo(payment.getMpesaReceiptNo());
                sub.setPaymentId(payment.getId());
                subscriptionRepository.save(sub);

                // Update user subscription expiry
                userRepository.findById(payment.getUserId()).ifPresent(user -> {
                    user.setSubscriptionExpiresAt(endDate);
                    user.setSubscriptionActive(true);
                    userRepository.save(user);
                });
                User user = userRepository.findById(payment.getUserId()).orElse(null);
                if (user != null) {
                    notificationService.notify(
                            payment.getUserId(),
                            org.moseti.kedevsapi.shared.enums.NotificationCategory.PAYMENT,
                            "Payment Confirmed",
                            "Your annual membership payment of KES " + payment.getAmount() + " has been confirmed.",
                            "{\"receiptNo\":\"" + payment.getMpesaReceiptNo() + "\"}"
                    );
                    emailService.sendPaymentConfirmationEmail(user.getEmail(), user.getFullName(), "Annual Membership", payment.getAmount(), payment.getMpesaReceiptNo());
                }
                messagingTemplate.convertAndSendToUser(
                    payment.getUserId().toString(),
                    "/queue/status",
                    new WebSocketEvent<>("STATUS_UPDATE", Map.of("membershipActive", true, "subscriptionExpiresAt", endDate))
                );
            }
            case EMPLOYER_PRO -> {
                LocalDateTime now = LocalDateTime.now();
                Subscription sub = new Subscription();
                sub.setUserId(payment.getUserId());
                sub.setType(SubscriptionType.EMPLOYER_PRO);
                sub.setStatus(SubscriptionStatus.ACTIVE);
                sub.setStartDate(now);
                sub.setEndDate(now.plusYears(1));
                sub.setAmountPaid(payment.getAmount());
                sub.setMpesaReceiptNo(payment.getMpesaReceiptNo());
                sub.setPaymentId(payment.getId());
                subscriptionRepository.save(sub);

                employerProfileRepository.findByUserId(payment.getUserId()).ifPresent(profile -> {
                    profile.setProAccount(true);
                    employerProfileRepository.save(profile);
                });
                User user = userRepository.findById(payment.getUserId()).orElse(null);
                if (user != null) {
                    notificationService.notify(
                            payment.getUserId(),
                            org.moseti.kedevsapi.shared.enums.NotificationCategory.PAYMENT,
                            "Employer Pro Activated",
                            "Your employer pro upgrade payment of KES " + payment.getAmount() + " has been confirmed.",
                            "{\"receiptNo\":\"" + payment.getMpesaReceiptNo() + "\"}"
                    );
                    emailService.sendPaymentConfirmationEmail(user.getEmail(), user.getFullName(), "Employer Pro Upgrade", payment.getAmount(), payment.getMpesaReceiptNo());
                }
                messagingTemplate.convertAndSendToUser(
                    payment.getUserId().toString(),
                    "/queue/status",
                    new WebSocketEvent<>("STATUS_UPDATE", Map.of("isProAccount", true))
                );
            }
            case VERIFIED_BADGE -> {
                verificationRequestRepository.findByUserId(payment.getUserId()).ifPresent(request -> {
                    request.setStatus(VerificationStatus.PENDING_DOCS);
                    request.setPaymentId(payment.getId());
                    verificationRequestRepository.save(request);
                });
                
                User user = userRepository.findById(payment.getUserId()).orElse(null);
                if (user != null) {
                    notificationService.notify(
                            payment.getUserId(),
                            org.moseti.kedevsapi.shared.enums.NotificationCategory.PAYMENT,
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
                UUID developerId = payment.getUserId();
                SpotlightType type = payment.getType() == PaymentType.SPOTLIGHT_DAY
                        ? SpotlightType.DAY : SpotlightType.WEEK;
                spotlightService.activateSpotlight(developerId, payment.getId(), type);
            }
            case SEARCH_TOKEN -> {
                SearchToken token = new SearchToken();
                token.setEmployerId(payment.getUserId());
                token.setTotalUses(getSettingValue("SEARCH_TOKEN_USES").intValue());
                token.setUsedCount(0);
                token.setPaymentId(payment.getId());
                searchTokenRepository.save(token);
            }
            default -> log.warn("Unhandled payment type: {}", payment.getType());
        }
    }

    // ====================== Query Methods ======================

    public Page<PaymentResponse> getPaymentHistory(UUID userId, Pageable pageable) {
        return paymentRepository.findByUserId(userId, pageable)
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

    public SubscriptionStatusResponse getSubscriptionStatus(UUID userId) {
        Subscription memberSub = subscriptionRepository.findByUserIdAndTypeAndStatus(
                userId, SubscriptionType.ANNUAL_MEMBERSHIP, SubscriptionStatus.ACTIVE).orElse(null);
        Subscription proSub = subscriptionRepository.findByUserIdAndTypeAndStatus(
                userId, SubscriptionType.EMPLOYER_PRO, SubscriptionStatus.ACTIVE).orElse(null);
        int tokensRemaining = searchTokenRepository.countByEmployerIdAndUsedCountLessThanTotalUses(userId);

        return new SubscriptionStatusResponse(
                memberSub != null,
                memberSub != null ? memberSub.getEndDate() : null,
                proSub != null,
                proSub != null ? proSub.getEndDate() : null,
                tokensRemaining
        );
    }

    public boolean hasActiveAnnualMembership(UUID userId) {
        return subscriptionRepository.findByUserIdAndTypeAndStatus(
                userId, SubscriptionType.ANNUAL_MEMBERSHIP, SubscriptionStatus.ACTIVE)
                .map(s -> s.getEndDate().isAfter(LocalDateTime.now()))
                .orElse(false);
    }

    public boolean hasActivePro(UUID userId) {
        return subscriptionRepository.existsByUserIdAndTypeAndStatus(
                userId, SubscriptionType.EMPLOYER_PRO, SubscriptionStatus.ACTIVE);
    }

    @Transactional
    public void consumeSearchToken(UUID employerId) {
        List<SearchToken> tokens = searchTokenRepository.findByEmployerIdAndUsedCountLessThanTotalUses(employerId);
        if (tokens.isEmpty()) {
            throw new InsufficientSearchTokensException("No search tokens available. Purchase a search token to continue.");
        }
        SearchToken token = tokens.get(0);
        token.setUsedCount(token.getUsedCount() + 1);
        searchTokenRepository.save(token);
    }

    public boolean canUseFilterTool(UUID employerId) {
        return hasActivePro(employerId) ||
                searchTokenRepository.countByEmployerIdAndUsedCountLessThanTotalUses(employerId) > 0;
    }

    public List<PlatformSettingResponse> getPlatformSettings() {
        return platformSettingRepository.findAll().stream()
                .map(s -> new PlatformSettingResponse(s.getSettingKey(), s.getSettingValue(), s.getDescription()))
                .toList();
    }

    /**
     * Manually confirm a pending spotlight payment for the current user.
     * Useful in development when the Daraja callback URL isn't publicly reachable.
     * In production, the STK push callback handles this automatically.
     */
    @Transactional
    public SpotlightSlotConfirmResponse confirmSpotlight(UUID userId) {
        // Find the most recent pending spotlight payment for this user
        Payment payment = paymentRepository.findFirstByUserIdAndTypeInAndStatusOrderByCreatedAtDesc(
                userId,
                List.of(PaymentType.SPOTLIGHT_DAY, PaymentType.SPOTLIGHT_WEEK),
                PaymentStatus.PENDING
        ).orElseThrow(() -> new BadRequestException(
                "No pending spotlight payment found. Please initiate a new payment."));

        // Mark it as completed
        payment.setStatus(PaymentStatus.COMPLETED);
        payment.setPaidAt(LocalDateTime.now());
        payment.setMpesaReceiptNo("MANUAL-" + System.currentTimeMillis());
        paymentRepository.save(payment);

        // Activate the slot
        SpotlightType type = payment.getType() == PaymentType.SPOTLIGHT_DAY
                ? SpotlightType.DAY : SpotlightType.WEEK;
        SpotlightSlot slot = spotlightService.activateSpotlight(userId, payment.getId(), type);

        // Notify user
        notificationService.notify(
                userId,
                org.moseti.kedevsapi.shared.enums.NotificationCategory.SPOTLIGHT,
                "Spotlight Activated!",
                "Your " + type.name() + " spotlight is now live.",
                null
        );

        return new SpotlightSlotConfirmResponse(slot.getId(), type, slot.getEndDate());
    }
}
