package com.example.hebekery.controller;

import com.example.hebekery.dto.ApiResponse;
import com.example.hebekery.dto.ProductReviewResponse;
import com.example.hebekery.model.Product;
import com.example.hebekery.model.ProductReview;
import com.example.hebekery.service.ProductReviewService;
import com.example.hebekery.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/reviews")
@PreAuthorize("hasAnyRole('ADMIN', 'STAFF_SALES')")
@Tag(name = "Admin Reviews", description = "Quản lý và kiểm duyệt đánh giá, nhận xét của khách hàng")
public class AdminReviewController {

    private final ProductReviewService productReviewService;
    private final ProductService productService;

    public AdminReviewController(ProductReviewService productReviewService, ProductService productService) {
        this.productReviewService = productReviewService;
        this.productService = productService;
    }

    @Operation(summary = "Xem toàn bộ đánh giá sản phẩm", description = "Lấy danh sách tất cả đánh giá của khách hàng (yêu cầu ADMIN hoặc STAFF_SALES)", security = @SecurityRequirement(name = "BearerAuth"))
    @GetMapping
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAllReviews() {
        List<ProductReview> reviews = productReviewService.getAllReviews();
        List<Map<String, Object>> result = reviews.stream().map(r -> {
            Product product = productService.getProductById(r.getProductId());
            String productName = product != null ? product.getName() : ("Sản phẩm Hebekery #" + r.getProductId());
            return Map.<String, Object>of(
                    "id", r.getId(),
                    "productId", r.getProductId(),
                    "productName", productName,
                    "userId", r.getUserId(),
                    "userName", r.getUserName() != null ? r.getUserName() : "Khách hàng",
                    "rating", r.getRating(),
                    "comment", r.getComment() != null ? r.getComment() : "",
                    "createdAt", r.getCreatedAt() != null ? r.getCreatedAt().toString() : ""
            );
        }).collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách đánh giá thành công", result));
    }

    @Operation(summary = "Xóa đánh giá vi phạm / spam", description = "Xóa một đánh giá không phù hợp khỏi hệ thống (yêu cầu ADMIN hoặc STAFF_SALES)", security = @SecurityRequirement(name = "BearerAuth"))
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteReview(
            @Parameter(description = "Mã đánh giá cần xóa") @PathVariable String id) {
        boolean deleted = productReviewService.adminDelete(id);
        if (!deleted) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.failure("Không tìm thấy đánh giá cần xóa"));
        }
        return ResponseEntity.ok(ApiResponse.success("Đã xóa đánh giá thành công", null));
    }
}
