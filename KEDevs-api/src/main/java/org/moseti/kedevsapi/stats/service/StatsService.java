package org.moseti.kedevsapi.stats.service;

import lombok.RequiredArgsConstructor;
import org.moseti.kedevsapi.jobs.repository.JobPostRepository;
import org.moseti.kedevsapi.shared.enums.JobStatus;
import org.moseti.kedevsapi.shared.enums.JobVisibility;
import org.moseti.kedevsapi.shared.enums.ProfileVisibility;
import org.moseti.kedevsapi.stats.dto.StatsDtos;
import org.moseti.kedevsapi.users.repository.DeveloperProfileRepository;
import org.moseti.kedevsapi.users.repository.EmployerProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class StatsService {

    private final DeveloperProfileRepository developerProfileRepository;
    private final EmployerProfileRepository employerProfileRepository;
    private final JobPostRepository jobPostRepository;

    @Transactional(readOnly = true)
    public StatsDtos.PublicStatsResponse getPublicStats() {
        long developers = developerProfileRepository.countByProfileVisibility(ProfileVisibility.PUBLIC);
        long companies = employerProfileRepository.countByIsApprovedTrue();
        long jobs = jobPostRepository.countActivePublicJobs(JobVisibility.PUBLIC, JobStatus.OPEN, java.time.LocalDate.now());

        return new StatsDtos.PublicStatsResponse(developers, companies, jobs);
    }
}
