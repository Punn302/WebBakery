package com.example.hebekery.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
@Tag(name = "Health Check", description = "Liveness and readiness healthcheck probe endpoint")
public class HealthController {

    @GetMapping
    @Operation(summary = "Kiểm tra tình trạng sức khỏe dịch vụ")
    public ResponseEntity<Map<String, Object>> checkHealth() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "hebekery-backend",
                "timestamp", Instant.now().toString()
        ));
    }
}
