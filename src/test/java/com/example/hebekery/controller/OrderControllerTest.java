package com.example.hebekery.controller;

import com.example.hebekery.dto.ApiResponse;
import com.example.hebekery.dto.PublicOrderTrackingResponse;
import com.example.hebekery.model.Order;
import com.example.hebekery.service.OrderService;
import com.example.hebekery.service.UserService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderControllerTest {

    @Mock
    private OrderService orderService;

    @Mock
    private UserService userService;

    @InjectMocks
    private OrderController orderController;

    @Test
    @DisplayName("track: Báo lỗi 400 Bad Request khi thiếu orderCode hoặc thiếu phone")
    void track_missingParameters_shouldReturnBadRequest() {
        // Thiếu cả 2
        ResponseEntity<ApiResponse<PublicOrderTrackingResponse>> res1 = orderController.track(null, null, null);
        assertEquals(HttpStatus.BAD_REQUEST, res1.getStatusCode());
        assertFalse(res1.getBody().isSuccess());

        // Có orderCode nhưng thiếu phone
        ResponseEntity<ApiResponse<PublicOrderTrackingResponse>> res2 = orderController.track("HBK-123", null, null);
        assertEquals(HttpStatus.BAD_REQUEST, res2.getStatusCode());
        assertFalse(res2.getBody().isSuccess());

        // Có phone nhưng thiếu orderCode
        ResponseEntity<ApiResponse<PublicOrderTrackingResponse>> res3 = orderController.track(null, null, "0987651234");
        assertEquals(HttpStatus.BAD_REQUEST, res3.getStatusCode());
        assertFalse(res3.getBody().isSuccess());

        verify(orderService, never()).trackOrder(anyString(), anyString());
    }

    @Test
    @DisplayName("track: Trả về 404 Not Found khi không tìm thấy đơn hàng hoặc số điện thoại không khớp")
    void track_notFound_shouldReturn404() {
        when(orderService.trackOrder("HBK-999", "0987651234")).thenReturn(null);

        ResponseEntity<ApiResponse<PublicOrderTrackingResponse>> response =
                orderController.track("HBK-999", null, "0987651234");

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNotNull(response.getBody());
        assertFalse(response.getBody().isSuccess());
    }

    @Test
    @DisplayName("track: Tra cứu thành công trả về PublicOrderTrackingResponse với PII được mask an toàn")
    void track_success_masksPii() {
        Order order = new Order();
        order.setId("ORD-TEST-1");
        order.setOrderCode("HBK-TEST-1");
        order.setCustomerName("Nguyễn Văn A");
        order.setPhone("0987651234");
        order.setAddress("123 Đường Lê Lợi, Phường Bến Nghé, Quận 1, TP.HCM");
        order.setUserId("SECRET-USER-ID-999");
        order.setAdminNote("GHI CHÚ NỘI BỘ BẢO MẬT");
        order.setOrderStatus("SHIPPING");
        order.setPaymentStatus("PAID");
        order.setPaymentMethod("VIETQR");
        order.setTotal(250000.0);

        PublicOrderTrackingResponse trackingResponse = PublicOrderTrackingResponse.from(order);
        when(orderService.trackOrder("HBK-TEST-1", "0987651234")).thenReturn(trackingResponse);

        ResponseEntity<ApiResponse<PublicOrderTrackingResponse>> response =
                orderController.track("HBK-TEST-1", null, "0987651234");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());

        PublicOrderTrackingResponse data = response.getBody().getData();
        assertNotNull(data);
        assertEquals("HBK-TEST-1", data.getOrderCode());
        assertEquals("Nguyễn Văn A", data.getCustomerName());

        // PII Masking assertions
        assertEquals("098***1234", data.getPhone());
        assertEquals("***, Quận 1, TP.HCM", data.getAddress());
        assertEquals("SHIPPING", data.getOrderStatus());
        assertEquals("PAID", data.getPaymentStatus());
        assertEquals(250000.0, data.getTotal());
    }
}
