package com.example.hebekery.controller;

import com.example.hebekery.dto.ApiResponse;
import com.example.hebekery.dto.ProductResponse;
import com.example.hebekery.dto.request.ProductRequest;
import com.example.hebekery.model.Category;
import com.example.hebekery.model.Product;
import com.example.hebekery.service.CategoryService;
import com.example.hebekery.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/products")
@PreAuthorize("hasAnyRole('ADMIN', 'STAFF_WAREHOUSE')")
public class AdminProductController {

    private final ProductService productService;
    private final CategoryService categoryService;

    public AdminProductController(ProductService productService, CategoryService categoryService) {
        this.productService = productService;
        this.categoryService = categoryService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ProductResponse>>> searchProducts(
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), size, Sort.by("id").descending());
        Page<Product> products = productService.searchProducts(keyword, pageable);
        Page<ProductResponse> responsePage = products.map(ProductResponse::from);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách sản phẩm thành công", responsePage));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductById(@PathVariable String id) {
        Product product = productService.getProductById(id);
        if (product == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.failure("Không tìm thấy sản phẩm với mã: " + id));
        }
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin sản phẩm thành công", ProductResponse.from(product)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(@Valid @RequestBody ProductRequest request) {
        Product product = new Product();
        product.setName(request.getName());

        Category category = resolveCategory(request);
        product.setCategory(category);

        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setImageUrl(request.getImageUrl());
        product.setBadge(request.getBadge() != null ? request.getBadge() : "");
        product.setTag(request.getTag() != null ? request.getTag() : "");
        product.setStockQuantity(request.getStockQuantity());
        product.setLowStockThreshold(request.getLowStockThreshold());
        product.setAverageCost(request.getAverageCost());
        product.setActive(request.isActive());
        product.setFeatured(request.isFeatured());

        Product saved = productService.saveProduct(product);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo sản phẩm mới thành công", ProductResponse.from(saved)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> updateProduct(
            @PathVariable String id,
            @Valid @RequestBody ProductRequest request) {
        Product existing = productService.getProductById(id);
        if (existing == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.failure("Không tìm thấy sản phẩm để cập nhật"));
        }

        existing.setName(request.getName());

        Category category = resolveCategory(request);
        if (category != null) {
            existing.setCategory(category);
        }

        existing.setDescription(request.getDescription());
        existing.setPrice(request.getPrice());
        if (request.getImageUrl() != null && !request.getImageUrl().isBlank()) {
            existing.setImageUrl(request.getImageUrl());
        }
        if (request.getBadge() != null) {
            existing.setBadge(request.getBadge());
        }
        if (request.getTag() != null) {
            existing.setTag(request.getTag());
        }
        existing.setLowStockThreshold(request.getLowStockThreshold());
        existing.setActive(request.isActive());
        existing.setFeatured(request.isFeatured());

        Product updated = productService.saveProduct(existing);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thông tin sản phẩm thành công", ProductResponse.from(updated)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable String id) {
        boolean deleted = productService.deleteProduct(id);
        if (!deleted) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.failure("Không tìm thấy sản phẩm để xóa"));
        }
        return ResponseEntity.ok(ApiResponse.success("Xóa sản phẩm thành công", null));
    }

    @PatchMapping("/{id}/threshold")
    public ResponseEntity<ApiResponse<ProductResponse>> updateThreshold(
            @PathVariable String id,
            @RequestBody Map<String, Integer> payload) {
        Integer threshold = payload.get("threshold");
        if (threshold == null || threshold < 0) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.failure("Ngưỡng cảnh báo phải là số nguyên >= 0"));
        }
        try {
            Product updated = productService.updateLowStockThreshold(id, threshold);
            return ResponseEntity.ok(ApiResponse.success("Cập nhật ngưỡng cảnh báo thành công", ProductResponse.from(updated)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.failure(e.getMessage()));
        }
    }

    private Category resolveCategory(ProductRequest request) {
        if (categoryService == null) {
            return null;
        }
        if (request.getCategoryId() != null) {
            Category cat = categoryService.getCategoryEntityById(request.getCategoryId());
            if (cat != null) {
                return cat;
            }
        }
        if (request.getCategory() != null && !request.getCategory().isBlank()) {
            return categoryService.getOrCreateCategoryByName(request.getCategory().trim());
        }
        return null;
    }
}
