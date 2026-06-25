package com.example.hebekery.repository;

import com.example.hebekery.model.ProductReview;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductReviewRepository extends JpaRepository<ProductReview, String> {
    List<ProductReview> findByProductIdOrderByCreatedAtDesc(String productId);
    Optional<ProductReview> findByProductIdAndUserId(String productId, String userId);
}
