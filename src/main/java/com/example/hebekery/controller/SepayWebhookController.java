package com.example.hebekery.controller;

import com.example.hebekery.dto.ApiResponse;
import com.example.hebekery.dto.PaymentStatusResponse;
import com.example.hebekery.dto.request.SepayWebhookPayload;
import com.example.hebekery.model.Order;
import com.example.hebekery.service.OrderService;
import com.example.hebekery.service.SepayWebhookService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/payment/sepay")
@Tag(name = "SePay Webhook & Payment", description = "Tiếp nhận webhook thanh toán tự động qua chuyển khoản ngân hàng SePay và kiểm tra trạng thái đơn")
public class SepayWebhookController {

    private final SepayWebhookService sepayWebhookService;
    private final OrderService orderService;

    public SepayWebhookController(SepayWebhookService sepayWebhookService, OrderService orderService) {
        this.sepayWebhookService = sepayWebhookService;
        this.orderService = orderService;
    }

    @Operation(summary = "Tiếp nhận thông báo thanh toán SePay", description = "Xác thực API Key, đối soát mã đơn hàng và tự động cập nhật trạng thái đơn sang PAID")
    @PostMapping("/webhook")
    public ResponseEntity<ApiResponse<Map<String, Object>>> handleWebhook(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody SepayWebhookPayload payload) {

        // 1. Kiểm tra xác thực Authorization header
        if (!sepayWebhookService.verifyApiKey(authHeader)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.failure("Unauthorized: Invalid SePay API Key"));
        }

        // 2. Xử lý nghiệp vụ Webhook
        try {
            boolean success = sepayWebhookService.processWebhook(payload);
            if (success) {
                return ResponseEntity.ok(ApiResponse.success(
                        "Xử lý thanh toán SePay thành công",
                        Map.of(
                                "success", true,
                                "referenceCode", payload.getReferenceCode() != null ? payload.getReferenceCode() : "",
                                "transferAmount", payload.getTransferAmount() != null ? payload.getTransferAmount() : 0
                        )
                ));
            } else {
                return ResponseEntity.ok(ApiResponse.success(
                        "Giao dịch đã được ghi nhận nhưng bị bỏ qua (không phải tiền vào hoặc không hợp lệ)",
                        Map.of("success", false)
                ));
            }
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.failure(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.failure("Lỗi xử lý webhook: " + e.getMessage()));
        }
    }

    @Operation(summary = "Kiểm tra trạng thái thanh toán đơn hàng công khai (Polling)", description = "Dành cho giao diện modal VietQR kiểm tra xem đơn hàng đã được xác nhận thanh toán thành công hay chưa")
    @GetMapping("/orders/{orderId}/status")
    public ResponseEntity<ApiResponse<PaymentStatusResponse>> checkOrderStatus(
            @Parameter(description = "Mã ID đơn hàng hoặc mã orderCode") @PathVariable String orderId) {
        try {
            Order order = orderService.getOrderById(orderId);
            boolean isPaid = "PAID".equalsIgnoreCase(order.getPaymentStatus());
            PaymentStatusResponse status = new PaymentStatusResponse(
                    order.getId(),
                    order.getOrderCode(),
                    order.getOrderStatus(),
                    order.getPaymentStatus(),
                    isPaid,
                    order.getTotal()
            );
            return ResponseEntity.ok(ApiResponse.success("Lấy trạng thái thanh toán thành công", status));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.failure(e.getMessage()));
        }
    }
}
