package com.example.hebekery.controller;

import com.example.hebekery.dto.ApiResponse;
import com.example.hebekery.dto.ProductResponse;
import com.example.hebekery.dto.PurchaseReceiptResponse;
import com.example.hebekery.dto.request.PurchaseReceiptBatchRequest;
import com.example.hebekery.model.Product;
import com.example.hebekery.model.PurchaseReceipt;
import com.example.hebekery.service.ProductService;
import com.example.hebekery.service.PurchaseReceiptService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "Admin Inventory & Warehouse", description = "Quản lý nhập kho, phiếu nhập hàng và theo dõi số lượng tồn kho")
public class AdminInventoryController {

    private final ProductService productService;
    private final PurchaseReceiptService purchaseReceiptService;

    public AdminInventoryController(ProductService productService, PurchaseReceiptService purchaseReceiptService) {
        this.productService = productService;
        this.purchaseReceiptService = purchaseReceiptService;
    }

    @Operation(summary = "Xem danh sách tồn kho sản phẩm", description = "Lấy dữ liệu tồn kho hiện tại, phân loại hết hàng hoặc sắp hết hàng (yêu cầu ADMIN hoặc STAFF_WAREHOUSE)", security = @SecurityRequirement(name = "BearerAuth"))
    @GetMapping
    public ResponseEntity<ApiResponse<Page<ProductResponse>>> getInventory(
            @Parameter(description = "Từ khóa tìm kiếm theo tên/SKU") @RequestParam(defaultValue = "") String keyword,
            @Parameter(description = "Số thứ tự trang") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Số sản phẩm trên mỗi trang") @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), size, Sort.by("name").ascending());
        Page<Product> products = productService.searchProducts(keyword, pageable);
        Page<ProductResponse> dtoPage = products.map(ProductResponse::from);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách tồn kho thành công", dtoPage));
    }

    @Operation(summary = "Cập nhật ngưỡng cảnh báo sắp hết hàng", description = "Điều chỉnh ngưỡng cảnh báo tồn kho cho sản phẩm", security = @SecurityRequirement(name = "BearerAuth"))
    @PutMapping("/{id}/threshold")
    public ResponseEntity<ApiResponse<ProductResponse>> updateInventoryThreshold(
            @Parameter(description = "Mã SKU / ID sản phẩm") @PathVariable String id,
            @RequestBody Map<String, Integer> payload) {
        Integer threshold = payload.get("threshold");
        if (threshold == null) {
            return ResponseEntity.badRequest().body(ApiResponse.failure("Ngưỡng cảnh báo sắp hết hàng không được để trống"));
        }
        Product updated = productService.updateLowStockThreshold(id, threshold);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật ngưỡng tồn kho thành công", ProductResponse.from(updated)));
    }

    @Operation(summary = "Tạo phiếu nhập kho (Batch Receipt)", description = "Nhập kho theo lô nhiều sản phẩm cùng lúc, tự động tính lại giá vốn bình quân gia quyền (WAC)", security = @SecurityRequirement(name = "BearerAuth"))
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

    @Operation(summary = "Tìm kiếm phiếu nhập kho", description = "Tra cứu lịch sử các đợt nhập kho theo từ khóa nhà cung cấp/mã phiếu và khoảng ngày", security = @SecurityRequirement(name = "BearerAuth"))
    @GetMapping("/receipts")
    public ResponseEntity<ApiResponse<Page<PurchaseReceiptResponse>>> searchReceipts(
            @Parameter(description = "Từ khóa tìm kiếm") @RequestParam(defaultValue = "") String keyword,
            @Parameter(description = "Từ ngày (YYYY-MM-DD)") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @Parameter(description = "Đến ngày (YYYY-MM-DD)") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @Parameter(description = "Số thứ tự trang") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Số phiếu trên mỗi trang") @RequestParam(defaultValue = "10") int size) {
        LocalDate reportFrom = from == null ? LocalDate.now().minusDays(29) : from;
        LocalDate reportTo = to == null ? LocalDate.now() : to;
        Pageable pageable = PageRequest.of(Math.max(page, 0), size, Sort.by("importedAt").descending());
        Page<PurchaseReceipt> receipts = purchaseReceiptService.search(keyword, reportFrom, reportTo, pageable);
        Page<PurchaseReceiptResponse> dtos = receipts.map(PurchaseReceiptResponse::from);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách phiếu nhập kho thành công", dtos));
    }

    @Operation(summary = "Xem chi tiết phiếu nhập kho theo mã", description = "Lấy danh sách các mặt hàng trong một đợt phiếu nhập kho", security = @SecurityRequirement(name = "BearerAuth"))
    @GetMapping("/receipts/{receiptCode}")
    public ResponseEntity<ApiResponse<List<PurchaseReceiptResponse>>> getReceiptsByCode(
            @Parameter(description = "Mã phiếu nhập kho (ví dụ: PNK-20261105-001)") @PathVariable String receiptCode) {
        List<PurchaseReceipt> receipts = purchaseReceiptService.getByReceiptCode(receiptCode);
        List<PurchaseReceiptResponse> dtos = receipts.stream()
                .map(PurchaseReceiptResponse::from)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Lấy chi tiết phiếu nhập kho thành công", dtos));
    }
}
