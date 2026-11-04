package com.example.hebekery.controller;

import com.example.hebekery.dto.ApiResponse;
import com.example.hebekery.dto.OrderDetailResponse;
import com.example.hebekery.dto.OrderResponse;
import com.example.hebekery.dto.request.AdminOrderUpdateRequest;
import com.example.hebekery.model.Order;
import com.example.hebekery.service.OrderService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/orders")
@PreAuthorize("hasAnyRole('ADMIN', 'STAFF_SALES')")
public class AdminOrderController {

    private final OrderService orderService;

    public AdminOrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<OrderResponse>>> searchOrders(
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(defaultValue = "") String orderStatus,
            @RequestParam(defaultValue = "") String paymentMethod,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), size, Sort.by("createdAt").descending());
        Page<OrderResponse> responsePage = orderService.searchOrders(keyword, orderStatus, paymentMethod, from, to, pageable);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách đơn hàng thành công", responsePage));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderDetailResponse>> getOrderById(@PathVariable String id) {
        Order order = orderService.getOrderById(id);
        if (order == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.failure("Không tìm thấy đơn hàng với mã: " + id));
        }
        return ResponseEntity.ok(ApiResponse.success("Lấy chi tiết đơn hàng thành công", OrderDetailResponse.from(order)));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<OrderDetailResponse>> updateOrderStatus(
            @PathVariable String id,
            @RequestBody AdminOrderUpdateRequest request) {
        Order updated = orderService.updateStatus(id, request.getOrderStatus(), request.getPaymentStatus());
        return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái đơn hàng thành công", OrderDetailResponse.from(updated)));
    }

    @PostMapping("/{id}/return")
    public ResponseEntity<ApiResponse<OrderDetailResponse>> reviewReturn(
            @PathVariable String id,
            @RequestBody Map<String, String> payload) {
        String decision = payload.get("decision");
        String adminNote = payload.get("adminNote");
        if (decision == null || decision.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.failure("Quyết định xử lý trả hàng không được để trống"));
        }
        Order updated = orderService.reviewReturn(id, decision, adminNote);
        return ResponseEntity.ok(ApiResponse.success("Xử lý yêu cầu hoàn trả thành công", OrderDetailResponse.from(updated)));
    }

    @PutMapping("/{id}/shipping")
    public ResponseEntity<ApiResponse<OrderDetailResponse>> updateShipping(
            @PathVariable String id,
            @RequestBody Map<String, String> payload) {
        String shippingCarrier = payload.getOrDefault("shippingCarrier", "");
        String trackingCode = payload.getOrDefault("trackingCode", "");
        Order updated = orderService.updateShippingInfo(id, shippingCarrier, trackingCode);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật vận chuyển thành công", OrderDetailResponse.from(updated)));
    }

    @PutMapping("/{id}/note")
    public ResponseEntity<ApiResponse<OrderDetailResponse>> updateAdminNote(
            @PathVariable String id,
            @RequestBody Map<String, String> payload) {
        String adminNote = payload.get("adminNote");
        Order updated = orderService.updateAdminNote(id, adminNote);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật ghi chú quản trị thành công", OrderDetailResponse.from(updated)));
    }
}
