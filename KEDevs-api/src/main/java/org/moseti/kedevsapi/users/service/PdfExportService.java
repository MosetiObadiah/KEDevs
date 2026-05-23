package org.moseti.kedevsapi.users.service;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.moseti.kedevsapi.users.dto.UserDtos.DeveloperSummaryResponse;
import org.moseti.kedevsapi.users.dto.UserDtos.DeveloperFilterRequest;
import org.moseti.kedevsapi.spotlight.dto.SpotlightDtos.PastSpotlightResponse;
import org.moseti.kedevsapi.payments.entity.Payment;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import org.xhtmlrenderer.pdf.ITextRenderer;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PdfExportService {

    private final TemplateEngine templateEngine;
    private String base64Logo = "";

    @PostConstruct
    public void init() {
        try {
            ClassPathResource resource = new ClassPathResource("static/KEDevs_logo.png");
            byte[] imageBytes = StreamUtils.copyToByteArray(resource.getInputStream());
            this.base64Logo = "data:image/png;base64," + Base64.getEncoder().encodeToString(imageBytes);
            log.info("PDF Export pre-cached company logo successfully.");
        } catch (Exception e) {
            log.error("Failed to pre-cache company logo for PDF exports", e);
        }
    }

    private void enrichContext(Context context, String filterSummary) {
        context.setVariable("base64Logo", base64Logo);
        context.setVariable("companyName", "KEDevs");
        context.setVariable("dateOfExport", DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm").format(LocalDateTime.now()));
        context.setVariable("filterSummary", filterSummary != null && !filterSummary.isBlank() ? filterSummary : "None (Full History)");
    }

    public byte[] generateDeveloperPdf(List<DeveloperSummaryResponse> profiles, DeveloperFilterRequest filter) {
        try {
            Context context = new Context();
            context.setVariable("developers", profiles);

            StringBuilder sb = new StringBuilder();
            if (filter != null) {
                if (filter.availabilityStatus() != null) sb.append("Availability: ").append(filter.availabilityStatus()).append("; ");
                if (filter.yearsOfExperience() != null) sb.append("Experience: ").append(filter.yearsOfExperience()).append("; ");
                if (filter.preferredWorkType() != null) sb.append("Work Preference: ").append(filter.preferredWorkType()).append("; ");
                if (filter.locationCity() != null && !filter.locationCity().isBlank()) sb.append("City: ").append(filter.locationCity()).append("; ");
                if (filter.locationCountry() != null && !filter.locationCountry().isBlank()) sb.append("Country: ").append(filter.locationCountry()).append("; ");
                if (filter.isVerified() != null) sb.append("Verified Only: ").append(filter.isVerified()).append("; ");
                if (filter.skills() != null && !filter.skills().isEmpty()) sb.append("Skills: ").append(String.join(", ", filter.skills())).append("; ");
                if (filter.currentLastRole() != null && !filter.currentLastRole().isBlank()) sb.append("Role Keyword: ").append(filter.currentLastRole()).append("; ");
            }
            String summary = sb.length() > 0 ? sb.toString() : "None (All Developers)";
            enrichContext(context, summary);

            String html = templateEngine.process("developer-export", context);
            return renderPdf(html);
        } catch (Exception e) {
            log.error("Failed to generate Developer PDF export", e);
            throw new RuntimeException("Failed to generate Developer PDF export", e);
        }
    }

    public byte[] generatePastSpotlightPdf(List<PastSpotlightResponse> spotlights) {
        try {
            Context context = new Context();
            context.setVariable("spotlights", spotlights);
            enrichContext(context, "None (Full History)");

            String html = templateEngine.process("past-spotlight-export", context);
            return renderPdf(html);
        } catch (Exception e) {
            log.error("Failed to generate Past Spotlight PDF export", e);
            throw new RuntimeException("Failed to generate Past Spotlight PDF export", e);
        }
    }

    public byte[] generatePastJobAdvertisementsPdf(List<org.moseti.kedevsapi.jobs.dto.PinnedJobSlotDtos.PastPinnedJobSlotResponse> slots) {
        try {
            Context context = new Context();
            context.setVariable("slots", slots);
            enrichContext(context, "None (Full History)");

            String html = templateEngine.process("job-advertisement-export", context);
            return renderPdf(html);
        } catch (Exception e) {
            log.error("Failed to generate Job Advertisements PDF export", e);
            throw new RuntimeException("Failed to generate Job Advertisements PDF export", e);
        }
    }

    public byte[] generatePaymentPdf(List<Payment> payments) {
        try {
            Context context = new Context();
            context.setVariable("payments", payments);
            enrichContext(context, "None (Full Ledger)");

            String html = templateEngine.process("payment-export", context);
            return renderPdf(html);
        } catch (Exception e) {
            log.error("Failed to generate Payment PDF export", e);
            throw new RuntimeException("Failed to generate Payment PDF export", e);
        }
    }

    public byte[] generateAdminPaymentPdf(List<org.moseti.kedevsapi.payments.dto.PaymentDtos.AdminPaymentResponse> payments, String filterSummary) {
        try {
            Context context = new Context();
            context.setVariable("payments", payments);
            enrichContext(context, filterSummary != null && !filterSummary.isBlank() ? filterSummary : "None (All Payments)");

            String html = templateEngine.process("admin-payment-export", context);
            return renderPdf(html);
        } catch (Exception e) {
            log.error("Failed to generate Admin Payment PDF export", e);
            throw new RuntimeException("Failed to generate Admin Payment PDF export", e);
        }
    }

    public byte[] generateVerificationPdf(List<org.moseti.kedevsapi.admin.dto.AdminDtos.VerificationRequestAdminResponse> requests) {
        try {
            Context context = new Context();
            context.setVariable("requests", requests);
            enrichContext(context, "None (All Pending & Historical)");

            String html = templateEngine.process("verification-export", context);
            return renderPdf(html);
        } catch (Exception e) {
            log.error("Failed to generate Verification PDF export", e);
            throw new RuntimeException("Failed to generate Verification PDF export", e);
        }
    }

    public byte[] generateJobPdf(List<org.moseti.kedevsapi.jobs.dto.JobDtos.JobSummaryResponse> jobs, org.moseti.kedevsapi.jobs.dto.JobDtos.JobSearchRequest filter, String generatedBy) {
        try {
            Context context = new Context();
            context.setVariable("jobs", jobs);
            context.setVariable("generatedBy", generatedBy);

            StringBuilder sb = new StringBuilder();
            if (filter != null) {
                if (filter.keyword() != null && !filter.keyword().isBlank()) sb.append("Keyword: ").append(filter.keyword()).append("; ");
                if (filter.locationCity() != null && !filter.locationCity().isBlank()) sb.append("City: ").append(filter.locationCity()).append("; ");
                if (filter.jobTypes() != null && !filter.jobTypes().isEmpty()) sb.append("Types: ").append(String.join(", ", filter.jobTypes().stream().map(Object::toString).toList())).append("; ");
                if (filter.workTypes() != null && !filter.workTypes().isEmpty()) sb.append("Work: ").append(String.join(", ", filter.workTypes().stream().map(Object::toString).toList())).append("; ");
                if (filter.experienceLevels() != null && !filter.experienceLevels().isEmpty()) sb.append("Levels: ").append(String.join(", ", filter.experienceLevels().stream().map(Object::toString).toList())).append("; ");
                if (filter.minSalary() != null) sb.append("Min Salary: ").append(filter.minSalary()).append("; ");
                if (filter.minQualification() != null && !filter.minQualification().isBlank()) sb.append("Min Qual: ").append(filter.minQualification()).append("; ");
                if (filter.minExperienceYears() != null) sb.append("Min Exp: ").append(filter.minExperienceYears()).append(" yrs; ");
                if (filter.deadlineFrom() != null) sb.append("Deadline From: ").append(filter.deadlineFrom()).append("; ");
                if (filter.deadlineTo() != null) sb.append("Deadline To: ").append(filter.deadlineTo()).append("; ");
                if (filter.isPeerSourced() != null) sb.append("Peer Sourced: ").append(filter.isPeerSourced()).append("; ");
                if (filter.status() != null) sb.append("Status: ").append(filter.status()).append("; ");
            }
            String summary = sb.length() > 0 ? sb.toString() : "None (All Active Jobs)";
            enrichContext(context, summary);

            String html = templateEngine.process("jobs-export", context);
            return renderPdf(html);
        } catch (Exception e) {
            log.error("Failed to generate Job PDF export", e);
            throw new RuntimeException("Failed to generate Job PDF export", e);
        }
    }

    public byte[] generateEmployerPdf(List<org.moseti.kedevsapi.users.dto.UserDtos.EmployerProfileResponse> profiles, org.moseti.kedevsapi.users.dto.UserDtos.EmployerFilterRequest filter, String generatedBy) {
        try {
            Context context = new Context();
            context.setVariable("profiles", profiles);
            context.setVariable("generatedBy", generatedBy);

            StringBuilder sb = new StringBuilder();
            if (filter != null) {
                if (filter.industries() != null && !filter.industries().isEmpty()) sb.append("Industries: ").append(String.join(", ", filter.industries())).append("; ");
                if (filter.sizes() != null && !filter.sizes().isEmpty()) sb.append("Sizes: ").append(String.join(", ", filter.sizes().stream().map(Object::toString).toList())).append("; ");
                if (filter.city() != null && !filter.city().isBlank()) sb.append("City: ").append(filter.city()).append("; ");
                if (filter.country() != null && !filter.country().isBlank()) sb.append("Country: ").append(filter.country()).append("; ");
                if (filter.hasOpenJobs() != null && filter.hasOpenJobs()) sb.append("With Open Jobs; ");
            }
            String summary = sb.length() > 0 ? sb.toString() : "None (All Employers)";
            enrichContext(context, summary);

            String html = templateEngine.process("employer-export", context);
            return renderPdf(html);
        } catch (Exception e) {
            log.error("Failed to generate Employer PDF export", e);
            throw new RuntimeException("Failed to generate Employer PDF export", e);
        }
    }

    private byte[] renderPdf(String html) throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ITextRenderer renderer = new ITextRenderer();
        renderer.setDocumentFromString(html);
        renderer.layout();
        renderer.createPDF(baos);
        return baos.toByteArray();
    }

    public record ExportChartData(
            String id,
            String title,
            String description,
            List<String> headers,
            List<List<String>> rows
    ) {}

    public byte[] generateAnalyticsPdf(List<ExportChartData> charts, String dateRange, String generatedBy) {
        try {
            Context context = new Context();
            context.setVariable("charts", charts);
            context.setVariable("dateRange", dateRange != null && !dateRange.isBlank() ? dateRange : "All Time");
            context.setVariable("generatedBy", generatedBy != null && !generatedBy.isBlank() ? generatedBy : "System Admin");
            enrichContext(context, "Analytics Executive Summary");

            String html = templateEngine.process("analytics-export", context);
            return renderPdf(html);
        } catch (Exception e) {
            log.error("Failed to generate Analytics PDF export", e);
            throw new RuntimeException("Failed to generate Analytics PDF export", e);
        }
    }

    public byte[] generateFlagsPdf(List<org.moseti.kedevsapi.admin.dto.AdminDtos.FlagExportResponse> flags, String filterSummary) {
        try {
            Context context = new Context();
            context.setVariable("flags", flags);
            enrichContext(context, filterSummary != null && !filterSummary.isBlank() ? filterSummary : "None (All Pending & Historical)");

            String html = templateEngine.process("flags-export", context);
            return renderPdf(html);
        } catch (Exception e) {
            log.error("Failed to generate Flags PDF export", e);
            throw new RuntimeException("Failed to generate Flags PDF export", e);
        }
    }
}
