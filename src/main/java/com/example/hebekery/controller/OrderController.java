package com.example.hebekery.controller;

import com.example.hebekery.service.OrderService;
import com.example.hebekery.service.UserService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
public class OrderController {
    private final OrderService orderService;
    private final UserService userService;

    public OrderController(OrderService orderService, UserService userService) {
        this.orderService = orderService;
        this.userService = userService;
    }

    @GetMapping("/api/orders/track")
    public Map<String, Object> track(@RequestParam(required = false) String orderId, @RequestParam(required = false) String phone) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("orders", orderService.trackOrders(orderId, phone));
        return response;
    }

    @GetMapping("/api/user/orders/{id}")
    public Map<String, Object> detail(@PathVariable String id) {
        requireLogin();
        var order = orderService.getOrderById(id);
        if (!order.getUserId().equals(userService.getCurrentUser().getId())) {
            throw new IllegalArgumentException("Bạn không có quyền xem đơn hàng này");
        }
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("order", order);
        return response;
    }

    @PostMapping("/api/user/orders/{id}/cancel")
    public Map<String, Object> cancel(@PathVariable String id) {
        requireLogin();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("order", orderService.cancelOrder(id, userService.getCurrentUser().getId()));
        return response;
    }

    @PostMapping("/api/user/orders/{id}/received")
    public Map<String, Object> received(@PathVariable String id) {
        requireLogin();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("order", orderService.markReceived(id, userService.getCurrentUser().getId()));
        response.put("message", "Đã xác nhận nhận hàng");
        return response;
    }

    @PostMapping("/api/user/orders/{id}/return")
    public Map<String, Object> requestReturn(@PathVariable String id, @RequestBody Map<String, String> payload) {
        requireLogin();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("order", orderService.requestReturn(id, userService.getCurrentUser().getId(), payload.get("reason")));
        response.put("message", "Đã gửi yêu cầu đổi trả");
        return response;
    }

    private void requireLogin() {
        if (!userService.isLoggedIn()) {
            throw new IllegalStateException("Vui lòng đăng nhập");
        }
    }
}
