package com.example.hebekery.service;

import com.example.hebekery.dto.CategoryResponse;
import com.example.hebekery.dto.request.CategoryRequest;
import com.example.hebekery.model.Category;
import com.example.hebekery.repository.CategoryRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private CategoryService categoryService;

    @Test
    @DisplayName("Lấy danh mục active sắp xếp theo tên")
    void getActiveCategories_returnsList() {
        Category cat = new Category(1L, "Ngũ cốc", "ngu-coc", "Mô tả", true);
        when(categoryRepository.findByActiveTrueOrderByNameAsc()).thenReturn(List.of(cat));

        List<CategoryResponse> result = categoryService.getActiveCategories();

        assertEquals(1, result.size());
        assertEquals("Ngũ cốc", result.get(0).getName());
    }

    @Test
    @DisplayName("Tạo danh mục mới tự động sinh slug tiếng Việt chuẩn")
    void createCategory_generatesSlug() {
        CategoryRequest request = new CategoryRequest("Bánh Ăn Kiêng & Keto", null, "Mô tả", true);

        when(categoryRepository.existsByNameIgnoreCase("Bánh Ăn Kiêng & Keto")).thenReturn(false);
        when(categoryRepository.existsBySlug("banh-an-kieng-keto")).thenReturn(false);
        when(categoryRepository.save(any())).thenAnswer(invocation -> {
            Category c = invocation.getArgument(0);
            c.setId(10L);
            return c;
        });

        CategoryResponse created = categoryService.createCategory(request);

        assertNotNull(created);
        assertEquals("Bánh Ăn Kiêng & Keto", created.getName());
        assertEquals("banh-an-kieng-keto", created.getSlug());
    }

    @Test
    @DisplayName("Tạo danh mục ném ngoại lệ khi tên đã tồn tại")
    void createCategory_duplicateName_throwsException() {
        CategoryRequest request = new CategoryRequest("Ngũ cốc", null, "Mô tả", true);
        when(categoryRepository.existsByNameIgnoreCase("Ngũ cốc")).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> categoryService.createCategory(request));
    }
}
