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

    // Pricing (loaded from platform_settings at runtime, these are fallback defaults only)
    public static final int DEFAULT_DEVELOPER_ANNUAL_FEE = 100;
    public static final int DEFAULT_EMPLOYER_ANNUAL_FEE = 200;
    public static final int DEFAULT_EMPLOYER_PRO_ANNUAL_FEE = 2000;
    public static final int DEFAULT_VERIFIED_BADGE_DEVELOPER = 250;
    public static final int DEFAULT_VERIFIED_BADGE_EMPLOYER = 400;
    public static final int DEFAULT_SPOTLIGHT_DAY_FEE = 100;
    public static final int DEFAULT_SPOTLIGHT_WEEK_FEE = 400;
    public static final int DEFAULT_SEARCH_TOKEN_FEE = 500;
    public static final int DEFAULT_SEARCH_TOKEN_USES = 3;

    // Daraja
    public static final String DARAJA_AUTH_URL =
            "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";
    public static final String DARAJA_STK_PUSH_URL =
            "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";
}