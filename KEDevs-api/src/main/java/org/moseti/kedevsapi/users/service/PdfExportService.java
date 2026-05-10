package org.moseti.kedevsapi.users.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.moseti.kedevsapi.users.dto.UserDtos.DeveloperSummaryResponse;
import org.moseti.kedevsapi.spotlight.dto.SpotlightDtos.PastSpotlightResponse;
import org.moseti.kedevsapi.payments.entity.Payment;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import org.xhtmlrenderer.pdf.ITextRenderer;

import java.io.ByteArrayOutputStream;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PdfExportService {

    private final TemplateEngine templateEngine;

    public byte[] generateDeveloperPdf(List<DeveloperSummaryResponse> profiles) {
        try {
            Context context = new Context();
            context.setVariable("developers", profiles);

            String html = templateEngine.process("developer-export", context);

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ITextRenderer renderer = new ITextRenderer();
            renderer.setDocumentFromString(html);
            renderer.layout();
            renderer.createPDF(baos);

            return baos.toByteArray();
        } catch (Exception e) {
            log.error("Failed to generate PDF export", e);
            throw new RuntimeException("Failed to generate PDF export", e);
        }
    }

    public byte[] generatePastSpotlightPdf(List<PastSpotlightResponse> spotlights) {
        try {
            Context context = new Context();
            context.setVariable("spotlights", spotlights);

            String html = templateEngine.process("past-spotlight-export", context);

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ITextRenderer renderer = new ITextRenderer();
            renderer.setDocumentFromString(html);
            renderer.layout();
            renderer.createPDF(baos);

            return baos.toByteArray();
        } catch (Exception e) {
            log.error("Failed to generate Past Spotlight PDF export", e);
            throw new RuntimeException("Failed to generate Past Spotlight PDF export", e);
        }
    }

    public byte[] generatePaymentPdf(List<Payment> payments) {
        try {
            Context context = new Context();
            context.setVariable("payments", payments);

            String html = templateEngine.process("payment-export", context);

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ITextRenderer renderer = new ITextRenderer();
            renderer.setDocumentFromString(html);
            renderer.layout();
            renderer.createPDF(baos);

            return baos.toByteArray();
        } catch (Exception e) {
            log.error("Failed to generate Payment PDF export", e);
            throw new RuntimeException("Failed to generate Payment PDF export", e);
        }
    }
}
