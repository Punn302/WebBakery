package com.example.hebekery.controller;

import com.example.hebekery.dto.ApiResponse;
import com.example.hebekery.dto.ProductResponse;
import com.example.hebekery.model.Product;
import com.example.hebekery.service.ProductService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductControllerTest {

    @Mock
    private ProductService productService;

    @InjectMocks
    private ProductController productController;

    @Test
    @DisplayName("Lấy danh sách sản phẩm phân trang thành công")
    void getProducts_success() {
        Product p = new Product("P-1", "Bánh ngũ cốc", "Ngũ cốc & Granola", "Mo ta", 50000, "url", "badge");
        Page<Product> page = new PageImpl<>(List.of(p), PageRequest.of(0, 12), 1);

        when(productService.getProductsPage(eq("all"), any())).thenReturn(page);

        ResponseEntity<ApiResponse<Page<ProductResponse>>> response = productController.getProducts(null, "all", 0, 12);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
        assertEquals(1, response.getBody().getData().getTotalElements());
        assertEquals("Bánh ngũ cốc", response.getBody().getData().getContent().get(0).getName());
    }

    @Test
    @DisplayName("Lấy chi tiết sản phẩm thành công khi sản phẩm tồn tại và đang kinh doanh")
    void getProductById_whenFound() {
        Product p = new Product("P-1", "Bánh ngũ cốc", "Ngũ cốc & Granola", "Mo ta", 50000, "url", "badge");
        p.setActive(true);

        when(productService.getProductById("P-1")).thenReturn(p);

        ResponseEntity<ApiResponse<ProductResponse>> response = productController.getProductById("P-1");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
        assertEquals("P-1", response.getBody().getData().getId());
    }

    @Test
    @DisplayName("Lấy chi tiết sản phẩm trả về 404 khi sản phẩm không tồn tại hoặc đã ngừng kinh doanh")
    void getProductById_whenNotFound() {
        when(productService.getProductById("P-999")).thenReturn(null);

        ResponseEntity<ApiResponse<ProductResponse>> response = productController.getProductById("P-999");

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNotNull(response.getBody());
        assertFalse(response.getBody().isSuccess());
    }

    @Test
    @DisplayName("Lấy danh sách sản phẩm nổi bật thành công")
    void getFeaturedProducts_success() {
        Product p = new Product("P-1", "Bánh ngũ cốc", "Ngũ cốc & Granola", "Mo ta", 50000, "url", "badge");
        when(productService.getFeaturedProducts()).thenReturn(List.of(p));

        ResponseEntity<ApiResponse<List<ProductResponse>>> response = productController.getFeaturedProducts();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
        assertEquals(1, response.getBody().getData().size());
    }

    @Test
    @DisplayName("Lấy danh mục sản phẩm thành công")
    void getCategories_success() {
        when(productService.getAllCategories()).thenReturn(List.of("Ngũ cốc", "Bánh ăn kiêng"));

        ResponseEntity<ApiResponse<List<String>>> response = productController.getCategories();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().getData().size());
    }
}
