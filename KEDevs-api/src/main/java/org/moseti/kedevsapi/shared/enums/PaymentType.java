package org.moseti.kedevsapi.shared.enums;

public enum PaymentType {
    /** @deprecated No longer offered. Kept to preserve existing DB rows. */
    @Deprecated
    ANNUAL_MEMBERSHIP,

    /** @deprecated No longer offered. Kept to preserve existing DB rows. */
    @Deprecated
    EMPLOYER_PRO,

    /** @deprecated No longer offered. Kept to preserve existing DB rows. */
    @Deprecated
    SEARCH_TOKEN,

    VERIFIED_BADGE,
    SPOTLIGHT_DAY,
    SPOTLIGHT_WEEK,
    PINNED_JOB_DAY,
    PINNED_JOB_3DAYS,
    PINNED_JOB_7DAYS
}