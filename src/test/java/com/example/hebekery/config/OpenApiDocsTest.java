package com.example.hebekery.config;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class OpenApiDocsTest {

    @LocalServerPort
    private int port;

    private final RestTemplate restTemplate = new RestTemplate();

    @Test
    @DisplayName("OpenAPI JSON endpoint /v3/api-docs trả về tài liệu hợp lệ với BearerAuth")
    void testOpenApiJsonDocs() {
        String url = "http://localhost:" + port + "/v3/api-docs";
        ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);

        assertEquals(200, response.getStatusCode().value());
        String body = response.getBody();
        assertNotNull(body);
        assertTrue(body.contains("Hebekery Healthy Bakery REST API"));
        assertTrue(body.contains("BearerAuth"));
        assertTrue(body.contains("/api/auth/login"));
        assertTrue(body.contains("/api/products"));
        assertTrue(body.contains("/api/categories"));
        assertTrue(body.contains("/api/cart"));
    }

    @Test
    @DisplayName("Swagger UI endpoint /swagger-ui/index.html có thể truy cập thành công")
    void testSwaggerUiHtml() {
        String url = "http://localhost:" + port + "/swagger-ui/index.html";
        ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);

        assertEquals(200, response.getStatusCode().value());
        String body = response.getBody();
        assertNotNull(body);
        assertTrue(body.contains("swagger-ui") || body.contains("Swagger UI") || body.contains("html"));
    }
}
