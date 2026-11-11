package com.example.hebekery.controller;

import com.example.hebekery.dto.ApiResponse;
import com.example.hebekery.dto.ProductBatchResponse;
import com.example.hebekery.service.ProductBatchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/batches")
@Tag(name = "Public Batch & Deals", description = "Các chương trình ưu đãi Cứu Bánh Lành cận date cho khách hàng")
public class PublicBatchController {

    private final ProductBatchService productBatchService;

    public PublicBatchController(ProductBatchService productBatchService) {
        this.productBatchService = productBatchService;
    }

    @Operation(summary = "Danh sách mẻ bánh cận date đang giảm giá Flash Sale", description = "Chương trình Cứu Bánh Lành - Tiết kiệm đến 40% cho bánh date gần")
    @GetMapping("/flash-sale")
    public ResponseEntity<ApiResponse<List<ProductBatchResponse>>> getActiveFlashSaleDeals() {
        List<ProductBatchResponse> deals = productBatchService.getActiveFlashSaleBatches();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách bánh giảm giá cận date thành công", deals));
    }
}
