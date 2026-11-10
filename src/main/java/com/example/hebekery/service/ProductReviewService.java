package com.example.hebekery.service;

import com.example.hebekery.dto.request.ProductReviewRequest;
import com.example.hebekery.model.Order;
import com.example.hebekery.model.ProductReview;
import com.example.hebekery.model.User;
import com.example.hebekery.repository.OrderRepository;
import com.example.hebekery.repository.ProductReviewRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ProductReviewService {
    private final ProductReviewRepository productReviewRepository;
    private final OrderRepository orderRepository;

    public ProductReviewService(ProductReviewRepository productReviewRepository, OrderRepository orderRepository) {
        this.productReviewRepository = productReviewRepository;
        this.orderRepository = orderRepository;
    }

    public List<ProductReview> getReviews(String productId) {
        return productReviewRepository.findByProductIdOrderByCreatedAtDesc(productId);
    }

    public List<ProductReview> getAllReviews() {
        return productReviewRepository.findAll();
    }

    public Optional<ProductReview> getUserReview(String productId, String userId) {
        return productReviewRepository.findByProductIdAndUserId(productId, userId);
    }

    public boolean canReview(String productId, User user) {
        return user != null;
    }

    public ProductReview save(String productId, User user, ProductReviewRequest request) {
        requireCanReview(productId, user);
        ProductReview review = getUserReview(productId, user.getId()).orElseGet(ProductReview::new);
        LocalDateTime now = LocalDateTime.now();
        if (review.getId() == null) {
            review.setId("RV-" + System.currentTimeMillis());
            review.setProductId(productId);
            review.setUserId(user.getId());
            review.setUserName(user.getName());
            review.setCreatedAt(now);
        }
        review.setRating(request.getRating());
        review.setComment(request.getComment().trim());
        review.setUpdatedAt(now);
        return productReviewRepository.save(review);
    }

    public boolean delete(String reviewId, User user) {
        ProductReview review = productReviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đánh giá"));
        if (user == null || !review.getUserId().equals(user.getId())) {
            throw new IllegalArgumentException("Bạn không có quyền xóa đánh giá này");
        }
        productReviewRepository.delete(review);
        return true;
    }

    public boolean adminDelete(String reviewId) {
        if (!productReviewRepository.existsById(reviewId)) {
            return false;
        }
        productReviewRepository.deleteById(reviewId);
        return true;
    }

    private void requireCanReview(String productId, User user) {
        if (!canReview(productId, user)) {
            throw new IllegalArgumentException("Vui lòng đăng nhập để gửi đánh giá sản phẩm");
        }
    }

    private boolean containsProduct(Order order, String productId) {
        return order.getItems().stream().anyMatch(item -> productId.equals(item.getProductId()));
    }
}
