package org.moseti.kedevsapi.shared.util;

public class StringUtils {

    private StringUtils() {}

    public static String sanitize(String input) {
        if (input == null) return null;
        return input.trim().replaceAll("\\s+", " ");
    }

    public static boolean isNullOrBlank(String input) {
        return input == null || input.isBlank();
    }

    public static String maskEmail(String email) {
        if (isNullOrBlank(email)) return email;
        int atIndex = email.indexOf('@');
        if (atIndex <= 1) return email;
        return email.charAt(0) + "*****" + email.substring(atIndex);
    }
}