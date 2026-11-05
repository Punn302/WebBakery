package com.example.hebekery.controller;

import com.example.hebekery.dto.ApiResponse;
import com.example.hebekery.dto.CategoryResponse;
import com.example.hebekery.dto.request.CategoryRequest;
import com.example.hebekery.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@Tag(name = "Category Management", description = "Quản lý và tra cứu danh mục bánh dinh dưỡng")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @Operation(summary = "Lấy danh mục đang hoạt động", description = "Dành cho khách hàng xem thanh danh mục trên giao diện người dùng")
    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getActiveCategories() {
        List<CategoryResponse> categories = categoryService.getActiveCategories();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách danh mục hoạt động thành công", categories));
    }

    @Operation(summary = "Xem chi tiết danh mục theo ID", description = "Lấy thông tin một danh mục theo mã định danh")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> getCategoryById(
            @Parameter(description = "ID danh mục") @PathVariable Long id) {
        CategoryResponse category = categoryService.getCategoryById(id);
        if (category == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Không tìm thấy danh mục với ID: " + id));
        }
        return ResponseEntity.ok(ApiResponse.success("Lấy chi tiết danh mục thành công", category));
    }

    @Operation(summary = "Quản lý danh sách danh mục (Admin)", description = "Lấy danh sách phân trang danh mục bao gồm cả trạng thái ẩn (yêu cầu quyền ADMIN)", security = @SecurityRequirement(name = "BearerAuth"))
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<CategoryResponse>>> getAllCategoriesForAdmin(
            @Parameter(description = "Từ khóa tìm kiếm theo tên hoặc slug") @RequestParam(required = false) String keyword,
            @Parameter(description = "Số thứ tự trang") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Kích thước trang") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Tiêu chí sắp xếp (ví dụ: id,desc)") @RequestParam(defaultValue = "id,desc") String[] sort) {

        String sortField = sort[0];
        Sort.Direction direction = (sort.length > 1 && "asc".equalsIgnoreCase(sort[1]))
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;

        Page<CategoryResponse> result = categoryService.getAllCategories(
                keyword,
                PageRequest.of(page, size, Sort.by(direction, sortField))
        );
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách danh mục quản trị thành công", result));
    }

    @Operation(summary = "Tạo danh mục mới (Admin)", description = "Thêm mới danh mục vào hệ thống (yêu cầu quyền ADMIN)", security = @SecurityRequirement(name = "BearerAuth"))
    @PostMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(@Valid @RequestBody CategoryRequest request) {
        try {
            CategoryResponse created = categoryService.createCategory(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Tạo danh mục mới thành công", created));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @Operation(summary = "Cập nhật danh mục (Admin)", description = "Chỉnh sửa tên, mô tả, slug hoặc trạng thái danh mục (yêu cầu quyền ADMIN)", security = @SecurityRequirement(name = "BearerAuth"))
    @PutMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(
            @Parameter(description = "ID danh mục cần sửa") @PathVariable Long id,
            @Valid @RequestBody CategoryRequest request) {
        try {
            CategoryResponse updated = categoryService.updateCategory(id, request);
            return ResponseEntity.ok(ApiResponse.success("Cập nhật danh mục thành công", updated));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @Operation(summary = "Xóa danh mục (Admin)", description = "Xóa danh mục nếu chưa có sản phẩm nào liên kết (yêu cầu quyền ADMIN)", security = @SecurityRequirement(name = "BearerAuth"))
    @DeleteMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(
            @Parameter(description = "ID danh mục cần xóa") @PathVariable Long id) {
        try {
            categoryService.deleteCategory(id);
            return ResponseEntity.ok(ApiResponse.success("Xóa danh mục thành công", null));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(ApiResponse.error(e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error(e.getMessage()));
        }
    }
}
