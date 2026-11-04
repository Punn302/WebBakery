package com.example.hebekery.controller;

import com.example.hebekery.dto.ApiResponse;
import com.example.hebekery.dto.ProductResponse;
import com.example.hebekery.dto.PurchaseReceiptResponse;
import com.example.hebekery.dto.request.PurchaseReceiptBatchRequest;
import com.example.hebekery.model.Product;
import com.example.hebekery.model.PurchaseReceipt;
import com.example.hebekery.service.ProductService;
import com.example.hebekery.service.PurchaseReceiptService;
import jakarta.validation.Valid;
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
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping({"/api/warehouse", "/api/admin/inventory"})
@PreAuthorize("hasAnyRole('ADMIN', 'STAFF_WAREHOUSE')")
public class AdminInventoryController {

    private final ProductService productService;
    private final PurchaseReceiptService purchaseReceiptService;

    public AdminInventoryController(ProductService productService, PurchaseReceiptService purchaseReceiptService) {
        this.productService = productService;
        this.purchaseReceiptService = purchaseReceiptService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ProductResponse>>> getInventory(
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), size, Sort.by("name").ascending());
        Page<Product> products = productService.searchProducts(keyword, pageable);
        Page<ProductResponse> dtoPage = products.map(ProductResponse::from);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách tồn kho thành công", dtoPage));
    }

    @PutMapping("/{id}/threshold")
    public ResponseEntity<ApiResponse<ProductResponse>> updateInventoryThreshold(
            @PathVariable String id,
            @RequestBody Map<String, Integer> payload) {
        Integer threshold = payload.get("threshold");
        if (threshold == null) {
            return ResponseEntity.badRequest().body(ApiResponse.failure("Ngưỡng cảnh báo sắp hết hàng không được để trống"));
        }
        Product updated = productService.updateLowStockThreshold(id, threshold);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật ngưỡng tồn kho thành công", ProductResponse.from(updated)));
    }

    @PostMapping("/receipts")
    public ResponseEntity<ApiResponse<List<PurchaseReceiptResponse>>> createPurchaseReceipt(
            @Valid @RequestBody PurchaseReceiptBatchRequest request) {
        List<PurchaseReceipt> receipts = purchaseReceiptService.createBatch(
                request.getProductIds(),
                request.getQuantities(),
                request.getUnitCosts(),
                request.getSupplier(),
                request.getNote()
        );
        List<PurchaseReceiptResponse> dtos = receipts.stream()
                .map(PurchaseReceiptResponse::from)
                .collect(Collectors.toList());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo phiếu nhập kho thành công", dtos));
    }

    @GetMapping("/receipts")
    public ResponseEntity<ApiResponse<Page<PurchaseReceiptResponse>>> searchReceipts(
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        LocalDate reportFrom = from == null ? LocalDate.now().minusDays(29) : from;
        LocalDate reportTo = to == null ? LocalDate.now() : to;
        Pageable pageable = PageRequest.of(Math.max(page, 0), size, Sort.by("importedAt").descending());
        Page<PurchaseReceipt> receipts = purchaseReceiptService.search(keyword, reportFrom, reportTo, pageable);
        Page<PurchaseReceiptResponse> dtos = receipts.map(PurchaseReceiptResponse::from);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách phiếu nhập kho thành công", dtos));
    }

    @GetMapping("/receipts/{receiptCode}")
    public ResponseEntity<ApiResponse<List<PurchaseReceiptResponse>>> getReceiptsByCode(@PathVariable String receiptCode) {
        List<PurchaseReceipt> receipts = purchaseReceiptService.getByReceiptCode(receiptCode);
        List<PurchaseReceiptResponse> dtos = receipts.stream()
                .map(PurchaseReceiptResponse::from)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Lấy chi tiết phiếu nhập kho thành công", dtos));
    }
}
