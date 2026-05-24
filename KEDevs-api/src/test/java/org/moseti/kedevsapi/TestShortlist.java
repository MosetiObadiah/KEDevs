package org.moseti.kedevsapi;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.moseti.kedevsapi.jobs.service.JobService;
import org.moseti.kedevsapi.jobs.dto.JobDtos.UpdateApplicationStatusRequest;
import org.moseti.kedevsapi.shared.enums.ApplicationStatus;
import org.moseti.kedevsapi.jobs.repository.JobApplicationRepository;
import org.moseti.kedevsapi.jobs.entity.JobApplication;
import java.util.UUID;
@SpringBootTest
public class TestShortlist {
    @Autowired JobService jobService;
    @Autowired JobApplicationRepository repo;
    @Test
    public void testShortlist() {
        JobApplication app = repo.findAll().get(0);
        System.out.println("Current status: " + app.getStatus());
        jobService.updateApplicationStatus(app.getJobPost().getPostedById(), app.getJobPost().getId(), app.getId(), new UpdateApplicationStatusRequest(ApplicationStatus.SHORTLISTED, "Congrats!"));
        JobApplication updated = repo.findById(app.getId()).get();
        System.out.println("New status: " + updated.getStatus());
    }
}
