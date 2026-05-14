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

    private byte[] renderPdf(String html) throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ITextRenderer renderer = new ITextRenderer();
        renderer.setDocumentFromString(html);
        renderer.layout();
        renderer.createPDF(baos);
        return baos.toByteArray();
    }
}
