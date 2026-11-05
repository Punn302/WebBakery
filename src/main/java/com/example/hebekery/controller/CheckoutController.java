package com.example.hebekery.controller;

import com.example.hebekery.dto.ApiResponse;
import com.example.hebekery.dto.CheckoutResponse;
import com.example.hebekery.dto.request.CheckoutRequest;
import com.example.hebekery.service.CartService;
import com.example.hebekery.service.OrderService;
import com.example.hebekery.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/checkout")
@PreAuthorize("isAuthenticated()")
@Tag(name = "Checkout & Payment", description = "Quy trình thanh toán và đặt hàng trực tuyến")
public class CheckoutController {

    private final CartService cartService;
    private final OrderService orderService;
    private final UserService userService;

    public CheckoutController(CartService cartService, OrderService orderService, UserService userService) {
        this.cartService = cartService;
        this.orderService = orderService;
        this.userService = userService;
    }

    @Operation(summary = "Tạo đơn hàng thanh toán", description = "Khởi tạo đơn hàng từ giỏ hàng hiện tại với hình thức COD hoặc chuyển khoản SePay/Momo", security = @SecurityRequirement(name = "BearerAuth"))
    @PostMapping
    public ResponseEntity<ApiResponse<CheckoutResponse>> checkout(@Valid @RequestBody CheckoutRequest request, HttpSession session) {
        if (!userService.isLoggedIn() || userService.getCurrentUser() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.failure("Vui lòng đăng nhập để tiến hành đặt hàng"));
        }

        if (cartService.getCartItems().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.failure("Giỏ hàng của bạn đang trống"));
        }

        CheckoutResponse checkout = orderService.createOrder(
                userService.getCurrentUser(),
                cartService.getCartItems(),
                cartService.getTotalPrice(),
                request
        );

        if ("COD".equalsIgnoreCase(checkout.getPaymentMethod())) {
            cartService.clearCart();
        }

        String msg = checkout.getMessage() != null ? checkout.getMessage() : "Đặt hàng thành công";
        return ResponseEntity.ok(ApiResponse.success(msg, checkout));
    }
}
