package org.moseti.kedevsapi.spotlight.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.moseti.kedevsapi.shared.dto.ApiResponse;
import org.moseti.kedevsapi.spotlight.dto.SpotlightDtos.*;
import org.moseti.kedevsapi.spotlight.service.SpotlightService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/spotlight")
@RequiredArgsConstructor
public class SpotlightController {

    private final SpotlightService spotlightService;

    @GetMapping("/current")
    public ResponseEntity<ApiResponse<CurrentSpotlightResponse>> getCurrentSpotlight() {
        return ResponseEntity.ok(ApiResponse.success("Current spotlight fetched",
                spotlightService.getCurrentSpotlight()));
    }

    @GetMapping("/availability")
    public ResponseEntity<ApiResponse<SlotAvailabilityResponse>> checkAvailability() {
        return ResponseEntity.ok(ApiResponse.success("Spotlight availability fetched",
                spotlightService.checkSlotAvailability()));
    }

    @GetMapping("/admin/slots")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<Page<SpotlightSlotResponse>>> getSlotHistory(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success("Spotlight history fetched",
                spotlightService.getSlotHistory(pageable)));
    }

    @PatchMapping("/admin/slots/{slotId}/override")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<SpotlightSlotResponse>> adminOverride(
            @PathVariable UUID slotId,
            @Valid @RequestBody AdminOverrideRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Spotlight slot overridden",
                spotlightService.adminOverride(slotId, request)));
    }
}
