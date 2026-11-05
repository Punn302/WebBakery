package com.example.hebekery.controller;

import com.example.hebekery.dto.ApiResponse;
import com.example.hebekery.dto.OrderDetailResponse;
import com.example.hebekery.dto.OrderResponse;
import com.example.hebekery.dto.request.AdminOrderUpdateRequest;
import com.example.hebekery.model.Order;
import com.example.hebekery.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "Admin Order Management", description = "Quản lý xử lý đơn hàng, đổi trạng thái và xác nhận giao hàng")
public class AdminOrderController {

    private final OrderService orderService;

    public AdminOrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @Operation(summary = "Tìm kiếm và lọc danh sách đơn hàng quản trị", description = "Lọc đơn hàng theo từ khóa, trạng thái, phương thức thanh toán và khoảng thời gian (yêu cầu ADMIN hoặc STAFF_SALES)", security = @SecurityRequirement(name = "BearerAuth"))
    @GetMapping
    public ResponseEntity<ApiResponse<Page<OrderResponse>>> searchOrders(
            @Parameter(description = "Từ khóa tìm kiếm theo mã đơn hoặc người nhận") @RequestParam(defaultValue = "") String keyword,
            @Parameter(description = "Trạng thái đơn hàng (PENDING, CONFIRMED, SHIPPING, DELIVERED, CANCELLED)") @RequestParam(defaultValue = "") String orderStatus,
            @Parameter(description = "Phương thức thanh toán (COD, MOMO, SEPAY)") @RequestParam(defaultValue = "") String paymentMethod,
            @Parameter(description = "Từ ngày (YYYY-MM-DD)") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @Parameter(description = "Đến ngày (YYYY-MM-DD)") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @Parameter(description = "Số thứ tự trang") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Số đơn hàng trên mỗi trang") @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), size, Sort.by("createdAt").descending());
        Page<OrderResponse> responsePage = orderService.searchOrders(keyword, orderStatus, paymentMethod, from, to, pageable);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách đơn hàng thành công", responsePage));
    }

    @Operation(summary = "Xem chi tiết đơn hàng quản trị", description = "Lấy đầy đủ thông tin mặt hàng, lịch sử trạng thái và đổi trả", security = @SecurityRequirement(name = "BearerAuth"))
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderDetailResponse>> getOrderById(
            @Parameter(description = "Mã định danh đơn hàng") @PathVariable String id) {
        Order order = orderService.getOrderById(id);
        if (order == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.failure("Không tìm thấy đơn hàng với mã: " + id));
        }
        return ResponseEntity.ok(ApiResponse.success("Lấy chi tiết đơn hàng thành công", OrderDetailResponse.from(order)));
    }

    @Operation(summary = "Cập nhật trạng thái đơn hàng và thanh toán", description = "Chuyển trạng thái đơn hàng (ví dụ: CONFIRMED -> SHIPPING -> DELIVERED)", security = @SecurityRequirement(name = "BearerAuth"))
    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<OrderDetailResponse>> updateOrderStatus(
            @Parameter(description = "Mã định danh đơn hàng") @PathVariable String id,
            @RequestBody AdminOrderUpdateRequest request) {
        Order updated = orderService.updateStatus(id, request.getOrderStatus(), request.getPaymentStatus());
        return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái đơn hàng thành công", OrderDetailResponse.from(updated)));
    }

    @Operation(summary = "Xử lý duyệt hoặc từ chối yêu cầu đổi trả", description = "Admin đưa ra quyết định (APPROVE / REJECT) và ghi chú nội bộ cho đơn đổi trả", security = @SecurityRequirement(name = "BearerAuth"))
    @PostMapping("/{id}/return")
    public ResponseEntity<ApiResponse<OrderDetailResponse>> reviewReturn(
            @Parameter(description = "Mã định danh đơn hàng") @PathVariable String id,
            @RequestBody Map<String, String> payload) {
        String decision = payload.get("decision");
        String adminNote = payload.get("adminNote");
        if (decision == null || decision.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.failure("Quyết định xử lý trả hàng không được để trống"));
        }
        Order updated = orderService.reviewReturn(id, decision, adminNote);
        return ResponseEntity.ok(ApiResponse.success("Xử lý yêu cầu hoàn trả thành công", OrderDetailResponse.from(updated)));
    }

    @Operation(summary = "Cập nhật đơn vị vận chuyển và mã vận đơn", description = "Lưu mã tracking và hãng chuyển phát cho đơn hàng", security = @SecurityRequirement(name = "BearerAuth"))
    @PutMapping("/{id}/shipping")
    public ResponseEntity<ApiResponse<OrderDetailResponse>> updateShipping(
            @Parameter(description = "Mã định danh đơn hàng") @PathVariable String id,
            @RequestBody Map<String, String> payload) {
        String shippingCarrier = payload.getOrDefault("shippingCarrier", "");
        String trackingCode = payload.getOrDefault("trackingCode", "");
        Order updated = orderService.updateShippingInfo(id, shippingCarrier, trackingCode);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật vận chuyển thành công", OrderDetailResponse.from(updated)));
    }

    @Operation(summary = "Cập nhật ghi chú nội bộ quản trị", description = "Lưu ghi chú xử lý đơn cho nhân viên bán hàng/chăm sóc khách hàng", security = @SecurityRequirement(name = "BearerAuth"))
    @PutMapping("/{id}/note")
    public ResponseEntity<ApiResponse<OrderDetailResponse>> updateAdminNote(
            @Parameter(description = "Mã định danh đơn hàng") @PathVariable String id,
            @RequestBody Map<String, String> payload) {
        String adminNote = payload.get("adminNote");
        Order updated = orderService.updateAdminNote(id, adminNote);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật ghi chú quản trị thành công", OrderDetailResponse.from(updated)));
    }
}
