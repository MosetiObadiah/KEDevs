package org.moseti.kedevsapi.users.service;

import com.opencsv.CSVWriter;
import lombok.extern.slf4j.Slf4j;
import org.moseti.kedevsapi.users.dto.UserDtos.DeveloperSummaryResponse;
import org.moseti.kedevsapi.spotlight.dto.SpotlightDtos.PastSpotlightResponse;
import org.moseti.kedevsapi.payments.entity.Payment;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Service
@Slf4j
public class CsvExportService {

    public byte[] generateDeveloperCsv(List<DeveloperSummaryResponse> profiles) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream();
             OutputStreamWriter osw = new OutputStreamWriter(baos, StandardCharsets.UTF_8);
             CSVWriter writer = new CSVWriter(osw)) {

            // Header row
            writer.writeNext(new String[]{
                "First Name", "Last Name", "Role", "Email", "Phone", "City", "Country", "Skills", "Availability", "Verified"
            });

            // Data rows
            for (DeveloperSummaryResponse p : profiles) {
                writer.writeNext(new String[]{
                        p.firstName() != null ? p.firstName() : "",
                        p.lastName() != null ? p.lastName() : "",
                        p.currentLastRole() != null ? p.currentLastRole() : "",
                        p.publicEmail() != null ? p.publicEmail() : "",
                        p.publicPhone() != null ? p.publicPhone() : "",
                        p.locationCity() != null ? p.locationCity() : "",
                        p.locationCountry() != null ? p.locationCountry() : "",
                        p.skills() != null ? String.join(", ", p.skills()) : "",
                        p.availabilityStatus() != null ? p.availabilityStatus().name() : "",
                        String.valueOf(p.isVerified())
                });
            }

            writer.flush();
            return baos.toByteArray();
        } catch (Exception e) {
            log.error("Failed to generate CSV export", e);
            throw new RuntimeException("Failed to generate CSV export", e);
        }
    }

    public byte[] generatePastSpotlightCsv(List<PastSpotlightResponse> spotlights) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream();
             OutputStreamWriter osw = new OutputStreamWriter(baos, StandardCharsets.UTF_8);
             CSVWriter writer = new CSVWriter(osw)) {

            // Header row
            writer.writeNext(new String[]{
                "Developer Name", "Role", "Spotlight Type", "Start Date", "End Date"
            });

            // Data rows
            for (PastSpotlightResponse s : spotlights) {
                writer.writeNext(new String[]{
                        s.developerName() != null ? s.developerName() : "",
                        s.currentLastRole() != null ? s.currentLastRole() : "",
                        s.type() != null ? s.type().name() : "",
                        s.startDate() != null ? s.startDate().toString() : "",
                        s.endDate() != null ? s.endDate().toString() : ""
                });
            }

            writer.flush();
            return baos.toByteArray();
        } catch (Exception e) {
            log.error("Failed to generate Past Spotlights CSV export", e);
            throw new RuntimeException("Failed to generate Past Spotlights CSV export", e);
        }
    }

    public byte[] generatePaymentCsv(List<Payment> payments) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream();
             OutputStreamWriter osw = new OutputStreamWriter(baos, StandardCharsets.UTF_8);
             CSVWriter writer = new CSVWriter(osw)) {

            // Header row
            writer.writeNext(new String[]{
                "Transaction ID", "Service Type", "Amount", "Currency", "Status", "Receipt No", "Phone Number", "Paid At"
            });

            // Data rows
            for (Payment p : payments) {
                writer.writeNext(new String[]{
                        p.getId() != null ? p.getId().toString() : "",
                        p.getType() != null ? p.getType().name() : "",
                        p.getAmount() != null ? p.getAmount().toString() : "0",
                        p.getCurrency() != null ? p.getCurrency() : "KES",
                        p.getStatus() != null ? p.getStatus().name() : "",
                        p.getMpesaReceiptNo() != null ? p.getMpesaReceiptNo() : "—",
                        p.getPhoneNumber() != null ? p.getPhoneNumber() : "",
                        p.getPaidAt() != null ? p.getPaidAt().toString() : ""
                });
            }

            writer.flush();
            return baos.toByteArray();
        } catch (Exception e) {
            log.error("Failed to generate Payments CSV export", e);
            throw new RuntimeException("Failed to generate Payments CSV export", e);
        }
    }
}
