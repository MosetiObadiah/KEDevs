package org.moseti.kedevsapi.shared.util;

public class Constants {

    private Constants() {}

    // Grace period
    public static final int GRACE_PERIOD_DAYS = 3;

    // JWT
    public static final String JWT_HEADER = "Authorization";
    public static final String JWT_PREFIX = "Bearer ";

    // Verification codes
    public static final int VERIFICATION_CODE_LENGTH = 6;
    public static final int VERIFICATION_CODE_EXPIRY_MINUTES = 15;

    // Pagination
    public static final int DEFAULT_PAGE_SIZE = 10;
    public static final int MAX_PAGE_SIZE = 50;

    // Spotlight
    public static final int SPOTLIGHT_DAY_DURATION_HOURS = 24;
    public static final int SPOTLIGHT_WEEK_DURATION_DAYS = 7;

    // Rate limiting
    public static final int MAX_CONTACT_REQUESTS_PER_DAY = 10;

    // Profile
    public static final int MAX_BIO_LENGTH = 300;
    public static final int MAX_ENDORSEMENT_LENGTH = 200;
}