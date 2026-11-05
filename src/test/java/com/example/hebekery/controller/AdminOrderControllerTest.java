package com.example.hebekery.controller;

import com.example.hebekery.dto.ApiResponse;
import com.example.hebekery.dto.OrderDetailResponse;
import com.example.hebekery.dto.OrderResponse;
import com.example.hebekery.dto.request.AdminOrderUpdateRequest;
import com.example.hebekery.model.Order;
import com.example.hebekery.service.OrderService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminOrderControllerTest {

    @Mock
    private OrderService orderService;

    @InjectMocks
    private AdminOrderController adminOrderController;

    @Test
    @DisplayName("searchOrders: Tìm kiếm đơn hàng trả về danh sách phân trang")
    void searchOrders_success() {
        OrderResponse orderDto = new OrderResponse("ORD-1", "05/11/2026", "bg-yellow", "Chờ xử lý", 2, 130000.0);
        Page<OrderResponse> page = new PageImpl<>(List.of(orderDto));

        when(orderService.searchOrders(eq("ORD-1"), eq(""), eq(""), any(), any(), any())).thenReturn(page);

        ResponseEntity<ApiResponse<Page<OrderResponse>>> response = adminOrderController.searchOrders(
                "ORD-1", "", "", null, null, 0, 10
        );

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
        assertEquals(1, response.getBody().getData().getTotalElements());
    }

    @Test
    @DisplayName("getOrderById: Lấy chi tiết đơn hàng thành công")
    void getOrderById_success() {
        Order order = new Order();
        order.setId("ORD-1");
        order.setOrderCode("HBK-20261105-001");
        order.setCustomerName("Khách Hàng A");
        order.setOrderStatus("PENDING");
        order.setPaymentStatus("PENDING");
        order.setCreatedAt(LocalDateTime.now());
        order.setItems(new ArrayList<>());

        when(orderService.getOrderById("ORD-1")).thenReturn(order);

        ResponseEntity<ApiResponse<OrderDetailResponse>> response = adminOrderController.getOrderById("ORD-1");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
        assertEquals("ORD-1", response.getBody().getData().getId());
    }

    @Test
    @DisplayName("updateOrderStatus: Cập nhật trạng thái đơn hàng thành công")
    void updateOrderStatus_success() {
        Order order = new Order();
        order.setId("ORD-1");
        order.setOrderCode("HBK-20261105-001");
        order.setOrderStatus("DELIVERED");
        order.setPaymentStatus("PAID");
        order.setCreatedAt(LocalDateTime.now());
        order.setItems(new ArrayList<>());

        AdminOrderUpdateRequest request = new AdminOrderUpdateRequest();
        request.setOrderStatus("DELIVERED");
        request.setPaymentStatus("PAID");

        when(orderService.updateStatus("ORD-1", "DELIVERED", "PAID")).thenReturn(order);

        ResponseEntity<ApiResponse<OrderDetailResponse>> response = adminOrderController.updateOrderStatus("ORD-1", request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
        assertEquals("DELIVERED", response.getBody().getData().getOrderStatus());
    }

    @Test
    @DisplayName("reviewReturn: Phê duyệt yêu cầu đổi trả thành công")
    void reviewReturn_success() {
        Order order = new Order();
        order.setId("ORD-1");
        order.setOrderStatus("RETURNED");
        order.setReturnStatus("APPROVED");
        order.setCreatedAt(LocalDateTime.now());
        order.setItems(new ArrayList<>());

        when(orderService.reviewReturn("ORD-1", "APPROVED", "Đã duyệt")).thenReturn(order);

        ResponseEntity<ApiResponse<OrderDetailResponse>> response = adminOrderController.reviewReturn(
                "ORD-1", Map.of("decision", "APPROVED", "adminNote", "Đã duyệt")
        );

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
        assertEquals("RETURNED", response.getBody().getData().getOrderStatus());
    }
}
