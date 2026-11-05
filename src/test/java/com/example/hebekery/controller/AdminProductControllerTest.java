package com.example.hebekery.controller;

import com.example.hebekery.dto.ApiResponse;
import com.example.hebekery.dto.ProductResponse;
import com.example.hebekery.dto.request.ProductRequest;
import com.example.hebekery.model.Product;
import com.example.hebekery.service.ProductService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminProductControllerTest {

    @Mock
    private ProductService productService;
    @Mock
    private com.example.hebekery.service.CategoryService categoryService;

    @InjectMocks
    private AdminProductController adminProductController;

    @Test
    @DisplayName("Tạo mới sản phẩm trả về HTTP 201 Created và ProductResponse")
    void createProduct_success() {
        ProductRequest request = new ProductRequest();
        request.setName("Bánh mì nguyên cám");
        request.setCategory("Bánh ăn kiêng");
        request.setPrice(45000);
        request.setStockQuantity(20);

        Product saved = new Product("P-100", "Bánh mì nguyên cám", "Bánh ăn kiêng", "Mo ta", 45000, null, null);
        saved.setStockQuantity(20);

        when(productService.saveProduct(any())).thenReturn(saved);

        ResponseEntity<ApiResponse<ProductResponse>> response = adminProductController.createProduct(request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
        assertEquals("Bánh mì nguyên cám", response.getBody().getData().getName());
        assertEquals(45000, response.getBody().getData().getPrice());
    }

    @Test
    @DisplayName("Xóa mềm sản phẩm thành công")
    void deleteProduct_success() {
        when(productService.deleteProduct("P-100")).thenReturn(true);

        ResponseEntity<ApiResponse<Void>> response = adminProductController.deleteProduct("P-100");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
    }

    @Test
    @DisplayName("Xóa sản phẩm thất bại khi không tìm thấy id")
    void deleteProduct_notFound() {
        when(productService.deleteProduct("P-999")).thenReturn(false);

        ResponseEntity<ApiResponse<Void>> response = adminProductController.deleteProduct("P-999");

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNotNull(response.getBody());
        assertFalse(response.getBody().isSuccess());
    }
}
