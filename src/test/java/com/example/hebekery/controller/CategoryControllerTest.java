package com.example.hebekery.controller;

import com.example.hebekery.dto.ApiResponse;
import com.example.hebekery.dto.CategoryResponse;
import com.example.hebekery.dto.request.CategoryRequest;
import com.example.hebekery.service.CategoryService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CategoryControllerTest {

    @Mock
    private CategoryService categoryService;

    @InjectMocks
    private CategoryController categoryController;

    @Test
    @DisplayName("Lấy danh sách danh mục hoạt động thành công")
    void getActiveCategories_success() {
        CategoryResponse cat = new CategoryResponse();
        cat.setId(1L);
        cat.setName("Ngũ cốc & Granola");
        cat.setSlug("ngu-coc-granola");

        when(categoryService.getActiveCategories()).thenReturn(List.of(cat));

        ResponseEntity<ApiResponse<List<CategoryResponse>>> response = categoryController.getActiveCategories();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
        assertEquals(1, response.getBody().getData().size());
        assertEquals("Ngũ cốc & Granola", response.getBody().getData().get(0).getName());
    }

    @Test
    @DisplayName("Lấy chi tiết danh mục theo ID thành công")
    void getCategoryById_success() {
        CategoryResponse cat = new CategoryResponse();
        cat.setId(1L);
        cat.setName("Bánh ăn kiêng");

        when(categoryService.getCategoryById(1L)).thenReturn(cat);

        ResponseEntity<ApiResponse<CategoryResponse>> response = categoryController.getCategoryById(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
        assertEquals("Bánh ăn kiêng", response.getBody().getData().getName());
    }

    @Test
    @DisplayName("Lấy chi tiết danh mục trả về 404 khi không tìm thấy")
    void getCategoryById_notFound() {
        when(categoryService.getCategoryById(99L)).thenReturn(null);

        ResponseEntity<ApiResponse<CategoryResponse>> response = categoryController.getCategoryById(99L);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNotNull(response.getBody());
        assertFalse(response.getBody().isSuccess());
    }

    @Test
    @DisplayName("Admin tạo danh mục mới thành công")
    void createCategory_success() {
        CategoryRequest request = new CategoryRequest("Snack healthy", "snack-healthy", "Mô tả", true);
        CategoryResponse responseDto = new CategoryResponse();
        responseDto.setId(2L);
        responseDto.setName("Snack healthy");

        when(categoryService.createCategory(any())).thenReturn(responseDto);

        ResponseEntity<ApiResponse<CategoryResponse>> response = categoryController.createCategory(request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
        assertEquals(2L, response.getBody().getData().getId());
    }

    @Test
    @DisplayName("Admin cập nhật danh mục thành công")
    void updateCategory_success() {
        CategoryRequest request = new CategoryRequest("Snack Mới", "snack-moi", "Mô tả mới", true);
        CategoryResponse responseDto = new CategoryResponse();
        responseDto.setId(2L);
        responseDto.setName("Snack Mới");

        when(categoryService.updateCategory(eq(2L), any())).thenReturn(responseDto);

        ResponseEntity<ApiResponse<CategoryResponse>> response = categoryController.updateCategory(2L, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
        assertEquals("Snack Mới", response.getBody().getData().getName());
    }

    @Test
    @DisplayName("Admin xóa danh mục thành công")
    void deleteCategory_success() {
        doNothing().when(categoryService).deleteCategory(2L);

        ResponseEntity<ApiResponse<Void>> response = categoryController.deleteCategory(2L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
    }
}
