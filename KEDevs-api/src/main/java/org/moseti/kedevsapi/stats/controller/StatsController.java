package org.moseti.kedevsapi.stats.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.moseti.kedevsapi.shared.dto.ApiResponse;
import org.moseti.kedevsapi.stats.dto.StatsDtos;
import org.moseti.kedevsapi.stats.service.StatsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/stats")
@RequiredArgsConstructor
@Tag(name = "Statistics", description = "Platform aggregate numbers and analytics")
public class StatsController {

    private final StatsService statsService;

    @Operation(summary = "Get public platform stats", description = "Aggregates total counts of public devs, approved companies and open jobs.")
    @GetMapping("/public")
    public ResponseEntity<ApiResponse<StatsDtos.PublicStatsResponse>> getPublicStats() {
        return ResponseEntity.ok(ApiResponse.success("Stats retrieved", statsService.getPublicStats()));
    }
}
