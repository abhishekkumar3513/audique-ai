package com.audique.controller;

import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class HealthControllerTest {

    private final HealthController healthController = new HealthController();

    @Test
    void healthCheck_ReturnsOk() {
        ResponseEntity<Map<String, String>> response = healthController.health();

        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals("ok", response.getBody().get("status"));
        assertTrue(response.getBody().get("message").contains("Audique"));
    }
}

