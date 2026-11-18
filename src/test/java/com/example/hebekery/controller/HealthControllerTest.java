package com.example.hebekery.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class HealthControllerTest {

    private final HealthController healthController = new HealthController();

    @Test
    @DisplayName("Health endpoint returns UP status and 200 OK")
    void checkHealth_shouldReturnUp() {
        ResponseEntity<Map<String, Object>> response = healthController.checkHealth();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("UP", response.getBody().get("status"));
        assertEquals("hebekery-backend", response.getBody().get("service"));
        assertNotNull(response.getBody().get("timestamp"));
    }
}
