package org.moseti.kedevsapi.stats.dto;

public class StatsDtos {
    public record PublicStatsResponse(
        long developerCount,
        long companyCount,
        long jobCount
    ) {}
}
