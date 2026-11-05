package com.example.hebekery.controller;

import com.example.hebekery.dto.ApiResponse;
import com.example.hebekery.dto.ProductResponse;
import com.example.hebekery.model.Product;
import com.example.hebekery.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/products")
@Tag(name = "Product Catalog", description = "Xem, tìm kiếm, lọc và xem chi tiết sản phẩm cho khách")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @Operation(summary = "Lấy danh sách sản phẩm phân trang", description = "Tìm kiếm và lọc sản phẩm theo từ khóa, ID danh mục hoặc tên danh mục")
    @GetMapping
    public ResponseEntity<ApiResponse<Page<ProductResponse>>> getProducts(
            @Parameter(description = "ID danh mục (ưu tiên cao nhất)") @RequestParam(required = false) Long categoryId,
            @Parameter(description = "Từ khóa tìm kiếm theo tên/mô tả") @RequestParam(required = false) String keyword,
            @Parameter(description = "Slug/tên danh mục (mặc định 'all')") @RequestParam(defaultValue = "all") String category,
            @Parameter(description = "Số thứ tự trang (bắt đầu từ 0)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Số phần tử trên mỗi trang") @RequestParam(defaultValue = "12") int size) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), size, Sort.by("id").ascending());
        Page<Product> products;
        if (categoryId != null) {
            products = productService.searchProducts(categoryId, keyword, pageable);
        } else if (keyword != null && !keyword.isBlank()) {
            products = productService.searchProducts(keyword.trim(), pageable);
        } else {
            products = productService.getProductsPage(category, pageable);
        }
        Page<ProductResponse> responsePage = products.map(ProductResponse::from);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách sản phẩm thành công", responsePage));
    }

    public ResponseEntity<ApiResponse<Page<ProductResponse>>> getProducts(
            String keyword,
            String category,
            int page,
            int size) {
        return getProducts(null, keyword, category, page, size);
    }

    @Operation(summary = "Xem chi tiết sản phẩm theo mã", description = "Trả về thông tin chi tiết một sản phẩm đang kinh doanh")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductById(
            @Parameter(description = "Mã SKU / ID sản phẩm") @PathVariable String id) {
        Product product = productService.getProductById(id);
        if (product == null || !product.isActive()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.failure("Không tìm thấy sản phẩm hoặc sản phẩm đã ngừng kinh doanh"));
        }
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin sản phẩm thành công", ProductResponse.from(product)));
    }

    @Operation(summary = "Lấy danh sách sản phẩm nổi bật", description = "Lấy danh sách các sản phẩm gắn cờ isFeatured để hiển thị trên trang chủ")
    @GetMapping("/featured")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getFeaturedProducts() {
        List<ProductResponse> responses = productService.getFeaturedProducts().stream()
                .map(ProductResponse::from)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách sản phẩm nổi bật thành công", responses));
    }

    @Operation(summary = "Lấy danh sách tên danh mục sản phẩm", description = "Trả về danh sách tên tất cả danh mục dùng cho bộ lọc thanh điều hướng")
    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<String>>> getCategories() {
        return ResponseEntity.ok(ApiResponse.success("Lấy danh mục sản phẩm thành công", productService.getAllCategories()));
    }

    @Operation(summary = "Lấy danh sách sản phẩm liên quan", description = "Gợi ý tối đa 4 sản phẩm cùng danh mục với sản phẩm hiện tại")
    @GetMapping("/{id}/related")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getRelatedProducts(
            @Parameter(description = "Mã SKU / ID sản phẩm tham chiếu") @PathVariable String id) {
        Product current = productService.getProductById(id);
        if (current == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.failure("Không tìm thấy sản phẩm"));
        }
        String categoryName = current.getCategoryName();
        List<ProductResponse> related = productService.getRelatedProducts(id, categoryName).stream()
                .map(ProductResponse::from)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách sản phẩm liên quan thành công", related));
    }
}
