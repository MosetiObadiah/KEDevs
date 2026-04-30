package org.moseti.kedevsapi.shared.util;

import org.junit.jupiter.api.Test;
import java.time.LocalDateTime;
import static org.junit.jupiter.api.Assertions.*;

class DateUtilsTest {

    @Test
    void gracePeriodExpiry_shouldBeThreeDaysFromNow() {
        LocalDateTime expiry = DateUtils.gracePeriodExpiry();
        assertTrue(expiry.isAfter(LocalDateTime.now().plusDays(2)));
        assertTrue(expiry.isBefore(LocalDateTime.now().plusDays(4)));
    }

    @Test
    void isExpired_shouldReturnTrueForPastDate() {
        assertTrue(DateUtils.isExpired(LocalDateTime.now().minusDays(1)));
    }

    @Test
    void isExpired_shouldReturnFalseForFutureDate() {
        assertFalse(DateUtils.isExpired(LocalDateTime.now().plusDays(1)));
    }

    @Test
    void isWithinGracePeriod_shouldReturnTrueForFutureDate() {
        assertTrue(DateUtils.isWithinGracePeriod(LocalDateTime.now().plusDays(2)));
    }
}