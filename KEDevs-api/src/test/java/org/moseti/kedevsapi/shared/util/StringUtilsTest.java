package org.moseti.kedevsapi.shared.util;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class StringUtilsTest {

    @Test
    void sanitize_shouldTrimAndCollapseSpaces() {
        assertEquals("hello world", StringUtils.sanitize("  hello   world  "));
    }

    @Test
    void sanitize_shouldReturnNullForNullInput() {
        assertNull(StringUtils.sanitize(null));
    }

    @Test
    void isNullOrBlank_shouldReturnTrueForBlank() {
        assertTrue(StringUtils.isNullOrBlank("   "));
        assertTrue(StringUtils.isNullOrBlank(null));
    }

    @Test
    void maskEmail_shouldMaskCorrectly() {
        assertEquals("j*****@gmail.com", StringUtils.maskEmail("john@gmail.com"));
    }
}