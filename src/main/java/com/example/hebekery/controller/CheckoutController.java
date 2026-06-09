package com.example.hebekery.controller;

import com.example.hebekery.dto.CheckoutResponse;
import com.example.hebekery.dto.request.CheckoutRequest;
import com.example.hebekery.service.CartService;
import com.example.hebekery.service.OrderService;
import com.example.hebekery.service.UserService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
public class CheckoutController {

    private final CartService cartService;
    private final OrderService orderService;
    private final UserService userService;

    public CheckoutController(CartService cartService, OrderService orderService, UserService userService) {
        this.cartService = cartService;
        this.orderService = orderService;
        this.userService = userService;
    }

    @PostMapping("/api/checkout")
    public Map<String, Object> checkout(@Valid @RequestBody CheckoutRequest request, HttpSession session) {
        if ("MOMO".equals(request.getPaymentMethod())) {
            orderService.validateCheckout(userService.getCurrentUser(), cartService.getCartItems());
            session.setAttribute("pendingMomoCheckout", request);

            CheckoutResponse checkout = new CheckoutResponse(
                    null,
                    "MOMO",
                    "PENDING",
                    "/checkout/momo-test",
                    "Chuyển đến MoMo test để xác nhận thanh toán."
            );
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("checkout", checkout);
            response.put("message", checkout.getMessage());
            return response;
        }

        CheckoutResponse checkout = orderService.createOrder(
                userService.getCurrentUser(),
                cartService.getCartItems(),
                cartService.getTotalPrice(),
                request
        );

        if ("COD".equals(checkout.getPaymentMethod())) {
            cartService.clearCart();
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("checkout", checkout);
        response.put("message", checkout.getMessage());
        return response;
    }

    @PostMapping("/api/payment/momo/ipn")
    public Map<String, Object> momoIpn() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "MoMo IPN test endpoint da san sang");
        return response;
    }
}
