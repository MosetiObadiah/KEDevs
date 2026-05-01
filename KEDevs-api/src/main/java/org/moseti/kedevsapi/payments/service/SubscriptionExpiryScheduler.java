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
                // TODO: send expiry warning email 7 days before via notifications module
                log.info("Annual membership expired for user {}", sub.getUserId());
            } else if (sub.getType() == SubscriptionType.EMPLOYER_PRO) {
                employerProfileRepository.findByUserId(sub.getUserId()).ifPresent(profile -> {
                    profile.setProAccount(false);
                    employerProfileRepository.save(profile);
                    log.info("Revoked Pro account for employer {}", sub.getUserId());
                });
            }
        }

        log.info("Subscription expiry check complete. Expired {} subscriptions.", expired.size());
    }
}
