package com.example.hebekery.controller;

import com.example.hebekery.dto.ApiResponse;
import com.example.hebekery.dto.OrderDetailResponse;
import com.example.hebekery.model.Order;
import com.example.hebekery.service.OrderService;
import com.example.hebekery.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping
public class OrderController {

    private final OrderService orderService;
    private final UserService userService;

    public OrderController(OrderService orderService, UserService userService) {
        this.orderService = orderService;
        this.userService = userService;
    }

    @GetMapping("/api/orders/track")
    public ResponseEntity<ApiResponse<List<OrderDetailResponse>>> track(
            @RequestParam(required = false) String orderId,
            @RequestParam(required = false) String phone) {
        List<Order> orders = orderService.trackOrders(orderId, phone);
        List<OrderDetailResponse> dtos = orders.stream()
                .map(OrderDetailResponse::from)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Tra cứu đơn hàng thành công", dtos));
    }

    @GetMapping({"/api/user/orders/{id}", "/api/orders/{id}"})
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<OrderDetailResponse>> detail(@PathVariable String id) {
        requireLogin();
        Order order = orderService.getOrderById(id);
        if (order == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.failure("Không tìm thấy đơn hàng với mã: " + id));
        }
        if (!order.getUserId().equals(userService.getCurrentUser().getId()) && !userService.isAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.failure("Bạn không có quyền xem đơn hàng này"));
        }
        return ResponseEntity.ok(ApiResponse.success("Lấy chi tiết đơn hàng thành công", OrderDetailResponse.from(order)));
    }

    @PostMapping({"/api/user/orders/{id}/cancel", "/api/orders/{id}/cancel"})
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<OrderDetailResponse>> cancel(@PathVariable String id) {
        requireLogin();
        Order order = orderService.cancelOrder(id, userService.getCurrentUser().getId());
        return ResponseEntity.ok(ApiResponse.success("Hủy đơn hàng thành công", OrderDetailResponse.from(order)));
    }

    @PostMapping({"/api/user/orders/{id}/received", "/api/orders/{id}/received"})
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<OrderDetailResponse>> received(@PathVariable String id) {
        requireLogin();
        Order order = orderService.markReceived(id, userService.getCurrentUser().getId());
        return ResponseEntity.ok(ApiResponse.success("Đã xác nhận nhận hàng thành công", OrderDetailResponse.from(order)));
    }

    @PostMapping({"/api/user/orders/{id}/return", "/api/orders/{id}/return"})
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<OrderDetailResponse>> requestReturn(
            @PathVariable String id,
            @RequestBody Map<String, String> payload) {
        requireLogin();
        String reason = payload.get("reason");
        Order order = orderService.requestReturn(id, userService.getCurrentUser().getId(), reason);
        return ResponseEntity.ok(ApiResponse.success("Đã gửi yêu cầu đổi trả thành công", OrderDetailResponse.from(order)));
    }

    private void requireLogin() {
        if (!userService.isLoggedIn() || userService.getCurrentUser() == null) {
            throw new IllegalStateException("Vui lòng đăng nhập để thực hiện thao tác này");
        }
    }
}
