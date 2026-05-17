package org.moseti.kedevsapi.admin.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.moseti.kedevsapi.jobs.dto.PinnedJobSlotDtos.AdminOverrideJobSlotRequest;
import org.moseti.kedevsapi.jobs.dto.PinnedJobSlotDtos.PastPinnedJobSlotResponse;
import org.moseti.kedevsapi.jobs.dto.PinnedJobSlotDtos.PinnedJobSlotResponse;
import org.moseti.kedevsapi.jobs.service.PinnedJobSlotService;
import org.moseti.kedevsapi.users.service.CsvExportService;
import org.moseti.kedevsapi.users.service.PdfExportService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.moseti.kedevsapi.shared.dto.ApiResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/job-advertisements")
@RequiredArgsConstructor
public class AdminJobAdvertisementController {

    private final PinnedJobSlotService pinnedJobSlotService;
    private final PdfExportService pdfExportService;
    private final CsvExportService csvExportService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<PinnedJobSlotResponse>>> getActiveSlots(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<PinnedJobSlotResponse> activeSlots = pinnedJobSlotService.getActiveSlots(PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success("Active slots fetched successfully", activeSlots));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<Page<PastPinnedJobSlotResponse>>> getSlotHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<PastPinnedJobSlotResponse> pastSlots = pinnedJobSlotService.getPastSlots(PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success("Slot history fetched successfully", pastSlots));
    }

    @PostMapping("/{slotId}/override")
    public ResponseEntity<ApiResponse<PinnedJobSlotResponse>> overrideSlot(
            @PathVariable UUID slotId,
            @Valid @RequestBody AdminOverrideJobSlotRequest request
    ) {
        UUID adminId = (UUID) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        PinnedJobSlotResponse overridden = pinnedJobSlotService.adminOverride(adminId, slotId, request);
        return ResponseEntity.ok(ApiResponse.success("Slot overridden successfully", overridden));
    }

    @GetMapping("/export/pdf")
    public ResponseEntity<byte[]> exportHistoryPdf() {
        List<PastPinnedJobSlotResponse> slots = pinnedJobSlotService.getPastSlotsForExport();
        byte[] pdfBytes = pdfExportService.generatePastJobAdvertisementsPdf(slots);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"job_advertisements_history.pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    @GetMapping("/export/csv")
    public ResponseEntity<byte[]> exportHistoryCsv() {
        List<PastPinnedJobSlotResponse> slots = pinnedJobSlotService.getPastSlotsForExport();
        byte[] csvBytes = csvExportService.generatePastJobAdvertisementsCsv(slots);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"job_advertisements_history.csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csvBytes);
    }
}
