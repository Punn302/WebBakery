package com.example.hebekery.controller;

import com.example.hebekery.dto.ApiResponse;
import com.example.hebekery.dto.BatchFlashSaleRequest;
import com.example.hebekery.dto.BatchStatsResponse;
import com.example.hebekery.dto.ProductBatchRequest;
import com.example.hebekery.dto.ProductBatchResponse;
import com.example.hebekery.service.ProductBatchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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

@RestController
@RequestMapping({"/api/warehouse/batches", "/api/admin/batches"})
@PreAuthorize("hasAnyRole('ADMIN', 'STAFF_WAREHOUSE')")
@Tag(name = "Admin Batch & Shelf-Life Management", description = "Quản lý lô sản xuất bánh, theo dõi hạn sử dụng (HSD) và chiến dịch Cứu Bánh Lành cận date")
public class AdminBatchController {

    private final ProductBatchService productBatchService;

    public AdminBatchController(ProductBatchService productBatchService) {
        this.productBatchService = productBatchService;
    }

    @Operation(summary = "Danh sách các lô bánh sản xuất", description = "Lọc theo sản phẩm và trạng thái (ACTIVE, NEAR_EXPIRY, EXPIRED, SOLD_OUT)", security = @SecurityRequirement(name = "BearerAuth"))
    @GetMapping
    public ResponseEntity<ApiResponse<Page<ProductBatchResponse>>> getBatches(
            @RequestParam(required = false) String productId,
            @RequestParam(required = false, defaultValue = "ALL") String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(Math.max(0, page), size, Sort.by("expiryDate").ascending());
        Page<ProductBatchResponse> result = productBatchService.searchBatches(productId, status, pageable);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách lô bánh thành công", result));
    }

    @Operation(summary = "Thống kê hạn sử dụng các lô bánh", description = "Tổng hợp số lô an toàn, cận date và hết hạn", security = @SecurityRequirement(name = "BearerAuth"))
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<BatchStatsResponse>> getStats() {
        BatchStatsResponse stats = productBatchService.getBatchStats();
        return ResponseEntity.ok(ApiResponse.success("Lấy thống kê lô bánh thành công", stats));
    }

    @Operation(summary = "Tạo mẻ bánh / lô sản xuất mới", description = "Ghi nhận NSX, HSD và số lượng bánh nướng mẻ mới", security = @SecurityRequirement(name = "BearerAuth"))
    @PostMapping
    public ResponseEntity<ApiResponse<ProductBatchResponse>> createBatch(@Valid @RequestBody ProductBatchRequest request) {
        ProductBatchResponse created = productBatchService.createBatch(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo lô sản xuất mới thành công", created));
    }

    @Operation(summary = "Kích hoạt hoặc chỉnh sửa Flash Sale cận date", description = "Bật giảm giá xả hàng cho lô bánh sắp hết hạn (Cứu Bánh Lành)", security = @SecurityRequirement(name = "BearerAuth"))
    @PutMapping("/{id}/flash-sale")
    public ResponseEntity<ApiResponse<ProductBatchResponse>> updateFlashSale(
            @PathVariable String id,
            @Valid @RequestBody BatchFlashSaleRequest request) {
        ProductBatchResponse updated = productBatchService.updateBatchFlashSale(id, request.getDiscountPercent(), request.getNote());
        return ResponseEntity.ok(ApiResponse.success("Cập nhật giảm giá Flash Sale thành công", updated));
    }
}
