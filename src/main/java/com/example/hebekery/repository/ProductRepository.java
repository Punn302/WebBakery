package com.example.hebekery.repository;

import com.example.hebekery.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, String> {
    Page<Product> findByCategory(String category, Pageable pageable);
    Page<Product> findByNameContainingIgnoreCaseOrCategoryContainingIgnoreCaseOrBadgeContainingIgnoreCase(
            String name,
            String category,
            String badge,
            Pageable pageable
    );
}
