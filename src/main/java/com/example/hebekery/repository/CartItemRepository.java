package com.example.hebekery.repository;

import com.example.hebekery.model.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByUserId(String userId);
    void deleteByUserIdAndProductId(String userId, String productId);
}
