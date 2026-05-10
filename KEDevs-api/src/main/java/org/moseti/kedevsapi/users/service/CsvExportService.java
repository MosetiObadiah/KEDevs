package org.moseti.kedevsapi.users.service;

import com.opencsv.CSVWriter;
import lombok.extern.slf4j.Slf4j;
import org.moseti.kedevsapi.users.dto.UserDtos.DeveloperSummaryResponse;
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
}
