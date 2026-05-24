package org.moseti.kedevsapi;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.moseti.kedevsapi.jobs.repository.JobApplicationRepository;
@SpringBootTest
public class CheckAppsTest {
    @Autowired JobApplicationRepository repo;
    @Test
    public void printApps() {
        repo.findAll().forEach(a -> System.out.println("App ID: " + a.getId() + " Status: " + a.getStatus()));
    }
}
