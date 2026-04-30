package org.moseti.kedevsapi.shared.util;

import java.time.LocalDateTime;

public class DateUtils {

    private DateUtils() {}

    public static LocalDateTime gracePeriodExpiry() {
        return LocalDateTime.now().plusDays(3);
    }

    public static LocalDateTime annualSubscriptionExpiry() {
        return LocalDateTime.now().plusYears(1);
    }

    public static boolean isExpired(LocalDateTime expiry) {
        return expiry != null && LocalDateTime.now().isAfter(expiry);
    }

    public static boolean isWithinGracePeriod(LocalDateTime gracePeriodEndsAt) {
        return gracePeriodEndsAt != null && LocalDateTime.now().isBefore(gracePeriodEndsAt);
    }
}