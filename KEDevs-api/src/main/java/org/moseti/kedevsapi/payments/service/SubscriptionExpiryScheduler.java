package org.moseti.kedevsapi.payments.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.moseti.kedevsapi.payments.entity.Subscription;
import org.moseti.kedevsapi.payments.repository.SubscriptionRepository;
import org.moseti.kedevsapi.shared.enums.SubscriptionStatus;
import org.moseti.kedevsapi.shared.enums.SubscriptionType;
import org.moseti.kedevsapi.users.repository.EmployerProfileRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class SubscriptionExpiryScheduler {

    private final SubscriptionRepository subscriptionRepository;
    private final EmployerProfileRepository employerProfileRepository;
    private final org.moseti.kedevsapi.users.repository.UserRepository userRepository;
    private final org.moseti.kedevsapi.notifications.service.NotificationService notificationService;
    private final org.moseti.kedevsapi.auth.service.EmailService emailService;

    @Scheduled(cron = "0 0 2 * * *")
    @Transactional
    public void checkExpiredSubscriptions() {
        log.info("Running subscription expiry check...");

        List<Subscription> expired = subscriptionRepository
                .findByEndDateBeforeAndStatus(LocalDateTime.now(), SubscriptionStatus.ACTIVE);

        for (Subscription sub : expired) {
            sub.setStatus(SubscriptionStatus.EXPIRED);
            subscriptionRepository.save(sub);

            if (sub.getType() == SubscriptionType.ANNUAL_MEMBERSHIP) {
            } else if (sub.getType() == SubscriptionType.EMPLOYER_PRO) {
                employerProfileRepository.findByUserId(sub.getUserId()).ifPresent(profile -> {
                    profile.setProAccount(false);
                    employerProfileRepository.save(profile);
                    log.info("Revoked Pro account for employer {}", sub.getUserId());
                });
            }
        }

        log.info("Subscription expiry check complete. Expired {} subscriptions.", expired.size());

        // 7-day expiry warnings
        LocalDateTime now = LocalDateTime.now();
        List<Subscription> expiringSoon = subscriptionRepository.findByEndDateBetweenAndStatus(
                now.plusDays(6), now.plusDays(7), SubscriptionStatus.ACTIVE);

        for (Subscription sub : expiringSoon) {
            userRepository.findById(sub.getUserId()).ifPresent(user -> {
                notificationService.notify(
                        sub.getUserId(),
                        org.moseti.kedevsapi.shared.enums.NotificationCategory.PAYMENT,
                        "Subscription Expiring Soon",
                        "Your subscription expires in 7 days. Renew now.",
                        null
                );
                emailService.sendSubscriptionExpiryWarningEmail(user.getEmail(), user.getFullName(), sub.getEndDate());
            });
        }
    }
}
