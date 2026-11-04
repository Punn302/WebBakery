package com.example.hebekery.controller;

import com.example.hebekery.dto.ApiResponse;
import com.example.hebekery.dto.ProductReviewResponse;
import com.example.hebekery.dto.ProductReviewSummaryResponse;
import com.example.hebekery.dto.request.ProductReviewRequest;
import com.example.hebekery.model.ProductReview;
import com.example.hebekery.service.ProductReviewService;
import com.example.hebekery.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping
public class ProductReviewController {

    private final ProductReviewService productReviewService;
    private final UserService userService;

    public ProductReviewController(ProductReviewService productReviewService, UserService userService) {
        this.productReviewService = productReviewService;
        this.userService = userService;
    }

    @GetMapping("/api/products/{productId}/reviews")
    public ResponseEntity<ApiResponse<ProductReviewSummaryResponse>> list(@PathVariable String productId) {
        List<ProductReview> reviews = productReviewService.getReviews(productId);
        List<ProductReviewResponse> reviewDtos = reviews.stream()
                .map(ProductReviewResponse::from)
                .collect(Collectors.toList());

        double avgRating = reviews.stream()
                .mapToInt(ProductReview::getRating)
                .average()
                .orElse(0.0);

        boolean canReview = productReviewService.canReview(productId, userService.getCurrentUser());
        ProductReviewResponse myReview = null;
        if (userService.isLoggedIn() && userService.getCurrentUser() != null) {
            myReview = productReviewService.getUserReview(productId, userService.getCurrentUser().getId())
                    .map(ProductReviewResponse::from)
                    .orElse(null);
        }

        ProductReviewSummaryResponse summary = new ProductReviewSummaryResponse(
                reviewDtos,
                canReview,
                myReview,
                Math.round(avgRating * 10.0) / 10.0,
                reviews.size()
        );

        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách đánh giá thành công", summary));
    }

    @PostMapping("/api/products/{productId}/reviews")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ProductReviewResponse>> save(
            @PathVariable String productId,
            @Valid @RequestBody ProductReviewRequest request) {
        requireLogin();
        ProductReview saved = productReviewService.save(productId, userService.getCurrentUser(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Đã lưu đánh giá sản phẩm", ProductReviewResponse.from(saved)));
    }

    @DeleteMapping("/api/products/reviews/{reviewId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String reviewId) {
        requireLogin();
        boolean deleted = productReviewService.delete(reviewId, userService.getCurrentUser());
        if (!deleted) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.failure("Không tìm thấy đánh giá để xóa"));
        }
        return ResponseEntity.ok(ApiResponse.success("Đã xóa đánh giá thành công", null));
    }

    private void requireLogin() {
        if (!userService.isLoggedIn() || userService.getCurrentUser() == null) {
            throw new IllegalStateException("Vui lòng đăng nhập để thực hiện thao tác này");
        }
    }
}
