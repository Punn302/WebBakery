package com.example.hebekery.controller;

import com.example.hebekery.dto.ApiResponse;
import com.example.hebekery.dto.PaymentStatusResponse;
import com.example.hebekery.dto.request.SepayWebhookPayload;
import com.example.hebekery.model.Order;
import com.example.hebekery.service.OrderService;
import com.example.hebekery.service.SepayWebhookService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SepayWebhookControllerTest {

    @Mock
    private SepayWebhookService sepayWebhookService;

    @Mock
    private OrderService orderService;

    @InjectMocks
    private SepayWebhookController sepayWebhookController;

    @Test
    @DisplayName("handleWebhook: Tiếp nhận thành công khi header và payload hợp lệ")
    void handleWebhook_success() {
        SepayWebhookPayload payload = new SepayWebhookPayload();
        payload.setReferenceCode("FT123");
        payload.setTransferAmount(280000.0);

        when(sepayWebhookService.verifyApiKey("Apikey valid_secret")).thenReturn(true);
        when(sepayWebhookService.processWebhook(payload)).thenReturn(true);

        ResponseEntity<ApiResponse<Map<String, Object>>> response = sepayWebhookController.handleWebhook(
                "Apikey valid_secret",
                payload
        );

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
        assertEquals("FT123", response.getBody().getData().get("referenceCode"));
    }

    @Test
    @DisplayName("handleWebhook: Trả về 401 khi API key không hợp lệ")
    void handleWebhook_unauthorized() {
        SepayWebhookPayload payload = new SepayWebhookPayload();
        when(sepayWebhookService.verifyApiKey("Apikey invalid_key")).thenReturn(false);

        ResponseEntity<ApiResponse<Map<String, Object>>> response = sepayWebhookController.handleWebhook(
                "Apikey invalid_key",
                payload
        );

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertFalse(response.getBody().isSuccess());
        verify(sepayWebhookService, never()).processWebhook(any());
    }

    @Test
    @DisplayName("handleWebhook: Trả về 400 khi service ném IllegalArgumentException")
    void handleWebhook_badRequest() {
        SepayWebhookPayload payload = new SepayWebhookPayload();
        when(sepayWebhookService.verifyApiKey("Apikey key")).thenReturn(true);
        when(sepayWebhookService.processWebhook(payload)).thenThrow(new IllegalArgumentException("Không tìm thấy đơn hàng"));

        ResponseEntity<ApiResponse<Map<String, Object>>> response = sepayWebhookController.handleWebhook(
                "Apikey key",
                payload
        );

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Không tìm thấy đơn hàng", response.getBody().getMessage());
    }

    @Test
    @DisplayName("checkOrderStatus: Lấy trạng thái thanh toán đơn hàng thành công")
    void checkOrderStatus_success() {
        Order order = new Order();
        order.setId("ORD-999");
        order.setOrderCode("HBK-20261105-ABC");
        order.setOrderStatus("PROCESSING");
        order.setPaymentStatus("PAID");
        order.setTotal(320000.0);

        when(orderService.getOrderById("ORD-999")).thenReturn(order);

        ResponseEntity<ApiResponse<PaymentStatusResponse>> response = sepayWebhookController.checkOrderStatus("ORD-999");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
        PaymentStatusResponse status = response.getBody().getData();
        assertEquals("ORD-999", status.getOrderId());
        assertEquals("PAID", status.getPaymentStatus());
        assertTrue(status.isPaid());
    }

    @Test
    @DisplayName("checkOrderStatus: Trả về 404 khi không tìm thấy đơn hàng")
    void checkOrderStatus_notFound() {
        when(orderService.getOrderById("ORD-NONEXIST")).thenThrow(new IllegalArgumentException("Không tìm thấy đơn hàng"));

        ResponseEntity<ApiResponse<PaymentStatusResponse>> response = sepayWebhookController.checkOrderStatus("ORD-NONEXIST");

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNotNull(response.getBody());
        assertFalse(response.getBody().isSuccess());
    }
}
