package com.example.hebekery.controller;

import com.example.hebekery.dto.request.ProductReviewRequest;
import com.example.hebekery.service.ProductReviewService;
import com.example.hebekery.service.UserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
public class ProductReviewController {
    private final ProductReviewService productReviewService;
    private final UserService userService;

    public ProductReviewController(ProductReviewService productReviewService, UserService userService) {
        this.productReviewService = productReviewService;
        this.userService = userService;
    }

    @GetMapping("/api/products/{productId}/reviews")
    public Map<String, Object> list(@PathVariable String productId) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("reviews", productReviewService.getReviews(productId));
        response.put("canReview", productReviewService.canReview(productId, userService.getCurrentUser()));
        if (userService.isLoggedIn()) {
            response.put("myReview", productReviewService.getUserReview(productId, userService.getCurrentUser().getId()).orElse(null));
        }
        return response;
    }

    @PostMapping("/api/products/{productId}/reviews")
    public Map<String, Object> save(@PathVariable String productId, @Valid @RequestBody ProductReviewRequest request) {
        requireLogin();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("review", productReviewService.save(productId, userService.getCurrentUser(), request));
        response.put("message", "Đã lưu đánh giá");
        return response;
    }

    @DeleteMapping("/api/products/reviews/{reviewId}")
    public Map<String, Object> delete(@PathVariable String reviewId) {
        requireLogin();
        Map<String, Object> response = new HashMap<>();
        response.put("success", productReviewService.delete(reviewId, userService.getCurrentUser()));
        response.put("message", "Đã xóa đánh giá");
        return response;
    }

    private void requireLogin() {
        if (!userService.isLoggedIn()) {
            throw new IllegalStateException("Vui lòng đăng nhập");
        }
    }
}
