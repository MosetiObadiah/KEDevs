package org.moseti.kedevsapi;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.moseti.kedevsapi.jobs.repository.JobApplicationRepository;
import org.moseti.kedevsapi.shared.enums.ApplicationStatus;
@SpringBootTest
public class CountAppsTest {
    @Autowired JobApplicationRepository repo;
    @Test
    public void printCounts() {
        System.out.println("SHORTLISTED count: " + repo.findAll().stream().filter(a -> a.getStatus() == ApplicationStatus.SHORTLISTED).count());
        System.out.println("REJECTED count: " + repo.findAll().stream().filter(a -> a.getStatus() == ApplicationStatus.REJECTED).count());
    }
}
