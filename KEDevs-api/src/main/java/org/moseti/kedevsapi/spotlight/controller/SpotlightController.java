package org.moseti.kedevsapi.spotlight.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.moseti.kedevsapi.spotlight.dto.SpotlightDtos.*;
import org.moseti.kedevsapi.spotlight.service.SpotlightService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/spotlight")
@RequiredArgsConstructor
@Tag(name = "Spotlight")
public class SpotlightController {

    private final SpotlightService spotlightService;
    private final org.moseti.kedevsapi.users.service.CsvExportService csvExportService;
    private final org.moseti.kedevsapi.users.service.PdfExportService pdfExportService;

    @Operation(summary = "Get active Day and Week spotlight cards", security = {})
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Current spotlight fetched successfully")
    })
    @GetMapping("/current")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<CurrentSpotlightResponse>> getCurrentSpotlight() {
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Current spotlight fetched",
                spotlightService.getCurrentSpotlight()));
    }

    @Operation(summary = "Check if Day/Week slots are currently available", security = {})
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Spotlight availability fetched successfully")
    })
    @GetMapping("/availability")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<SlotAvailabilityResponse>> checkAvailability() {
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Spotlight availability fetched",
                spotlightService.checkSlotAvailability()));
    }

    @Operation(summary = "Get my active spotlight slot", description = "Returns the developer's current active spotlight slot, or null if none.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "My spotlight status fetched"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT"),
        @ApiResponse(responseCode = "403", description = "Insufficient permissions")
    })
    @GetMapping("/my-status")
    @PreAuthorize("hasRole('DEVELOPER')")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<SpotlightSlotResponse>> getMySpotlightStatus(
            Authentication authentication) {
        UUID developerId = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("My spotlight status fetched",
                spotlightService.getMySpotlightStatus(developerId)));
    }

    @Operation(summary = "Admin: paginated spotlight slot history", description = "Requires ADMIN role.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Spotlight history fetched successfully"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT"),
        @ApiResponse(responseCode = "403", description = "Insufficient permissions")
    })
    @GetMapping("/admin/slots")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<Page<SpotlightSlotResponse>>> getSlotHistory(Pageable pageable) {
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Spotlight history fetched",
                spotlightService.getSlotHistory(pageable)));
    }

    @Operation(summary = "Admin: deactivate a spotlight slot", description = "Requires ADMIN role.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Spotlight slot overridden successfully"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT"),
        @ApiResponse(responseCode = "403", description = "Insufficient permissions"),
        @ApiResponse(responseCode = "404", description = "Spotlight slot not found")
    })
    @PatchMapping("/admin/slots/{slotId}/override")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<SpotlightSlotResponse>> adminOverride(
            @Parameter(description = "ID of the spotlight slot") @PathVariable UUID slotId,
            @Valid @RequestBody AdminOverrideRequest request) {
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Spotlight slot overridden",
                spotlightService.adminOverride(slotId, request)));
    }

    @Operation(summary = "Get past spotlight history", security = {})
    @GetMapping("/past")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<Page<PastSpotlightResponse>>> getPastSpotlights(Pageable pageable) {
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Past spotlights fetched",
                spotlightService.getPastSpotlights(pageable)));
    }

    @Operation(summary = "Export past spotlights", security = {})
    @GetMapping("/past/export")
    public ResponseEntity<Resource> exportPastSpotlights(@RequestParam String format) {
        var data = spotlightService.getPastSpotlightsForExport();
        byte[] file;
        String fileName;
        String contentType;

        if ("csv".equalsIgnoreCase(format)) {
            file = csvExportService.generatePastSpotlightCsv(data);
            fileName = "past_spotlights.csv";
            contentType = "text/csv";
        } else {
            file = pdfExportService.generatePastSpotlightPdf(data);
            fileName = "past_spotlights.pdf";
            contentType = "application/pdf";
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .contentType(MediaType.parseMediaType(contentType))
                .body(new ByteArrayResource(file));
    }
}
