package com.example.hebekery.controller;

import com.example.hebekery.dto.ApiResponse;
import com.example.hebekery.model.Product;
import com.example.hebekery.model.ProductReview;
import com.example.hebekery.service.ProductReviewService;
import com.example.hebekery.service.ProductService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminReviewControllerTest {

    @Mock
    private ProductReviewService productReviewService;

    @Mock
    private ProductService productService;

    @InjectMocks
    private AdminReviewController adminReviewController;

    @Test
    @DisplayName("getAllReviews: Trả về danh sách toàn bộ đánh giá sản phẩm")
    void getAllReviews_success() {
        ProductReview review = new ProductReview();
        review.setId("RV-001");
        review.setProductId("P001");
        review.setUserId("U1");
        review.setUserName("Nguyễn Văn A");
        review.setRating(5);
        review.setComment("Bánh rất ngon và giòn tan!");
        review.setCreatedAt(LocalDateTime.now());

        Product product = new Product();
        product.setId("P001");
        product.setName("Bánh Biscotti Truyền Thống");

        when(productReviewService.getAllReviews()).thenReturn(List.of(review));
        when(productService.getProductById("P001")).thenReturn(product);

        ResponseEntity<ApiResponse<List<Map<String, Object>>>> response = adminReviewController.getAllReviews();

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        assertEquals(1, response.getBody().getData().size());
        assertEquals("Bánh Biscotti Truyền Thống", response.getBody().getData().get(0).get("productName"));
    }

    @Test
    @DisplayName("deleteReview: Xóa đánh giá thành công")
    void deleteReview_success() {
        when(productReviewService.adminDelete("RV-001")).thenReturn(true);

        ResponseEntity<ApiResponse<Void>> response = adminReviewController.deleteReview("RV-001");

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
    }

    @Test
    @DisplayName("deleteReview: Trả về 404 khi không tìm thấy đánh giá cần xóa")
    void deleteReview_notFound() {
        when(productReviewService.adminDelete("RV-NOT-FOUND")).thenReturn(false);

        ResponseEntity<ApiResponse<Void>> response = adminReviewController.deleteReview("RV-NOT-FOUND");

        assertNotNull(response);
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertFalse(response.getBody().isSuccess());
    }
}
