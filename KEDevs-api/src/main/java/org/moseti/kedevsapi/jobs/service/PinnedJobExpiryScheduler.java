package org.moseti.kedevsapi.jobs.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.moseti.kedevsapi.jobs.entity.JobPost;
import org.moseti.kedevsapi.jobs.repository.JobPostRepository;
import org.moseti.kedevsapi.notifications.service.NotificationService;
import org.moseti.kedevsapi.shared.enums.NotificationCategory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Scheduled task that unpins expired job posts.
 *
 * Strategy:
 *  1. Collect the expired pinned jobs BEFORE the bulk update (to obtain postedById for notifications).
 *  2. Run a single JPQL bulk UPDATE to unpin them atomically — avoids race conditions and N+1 loads.
 *  3. Send notifications to job owners for each expired pin.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PinnedJobExpiryScheduler {

    private final JobPostRepository jobPostRepository;
    private final NotificationService notificationService;

    @Scheduled(fixedRate = 60_000) // every minute
    @Transactional
    public void unpinExpiredJobs() {
        LocalDateTime now = LocalDateTime.now();

        // Step 1: Collect jobs that are about to be unpinned so we can notify owners
        List<JobPost> expiring = jobPostRepository.findExpiredPinnedJobs(now);

        if (expiring.isEmpty()) {
            return;
        }

        // Step 2: Single bulk UPDATE — avoids loading entities, prevents partial-update races
        int count = jobPostRepository.unpinExpiredJobs(now);
        log.info("Unpinned {} expired job post(s)", count);

        // Step 3: Notify each owner
        expiring.forEach(job -> {
            try {
                notificationService.notify(
                        job.getPostedById(),
                        NotificationCategory.PINNED_JOB,
                        "Pin Expired",
                        "Your job '" + job.getTitle() + "' is no longer pinned. Renew to keep it featured at the top.",
                        "{\"jobId\":\"" + job.getId() + "\"}"
                );
            } catch (Exception e) {
                log.warn("Failed to send pin-expired notification for job {}: {}", job.getId(), e.getMessage());
            }
        });
    }
}
