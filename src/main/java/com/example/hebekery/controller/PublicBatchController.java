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
@Tag(name = "Ưu đãi Lô Bánh", description = "Các chương trình ưu đãi Giảm giá/Flash Sale cho khách hàng")
public class PublicBatchController {

    private final ProductBatchService productBatchService;

    public PublicBatchController(ProductBatchService productBatchService) {
        this.productBatchService = productBatchService;
    }

    @Operation(summary = "Danh sách bánh ưu đãi Flash Sale", description = "Các lô bánh đang trong chương trình Giảm giá/Flash Sale")
    @GetMapping("/flash-sale")
    public ResponseEntity<ApiResponse<List<ProductBatchResponse>>> getActiveFlashSaleDeals() {
        List<ProductBatchResponse> deals = productBatchService.getActiveFlashSaleBatches();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách bánh giảm giá thành công", deals));
    }
}
