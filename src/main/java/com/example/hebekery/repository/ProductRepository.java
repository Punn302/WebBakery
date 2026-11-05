package com.example.hebekery.repository;

import com.example.hebekery.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, String> {

    List<Product> findByActiveTrue();

    Page<Product> findByActiveTrue(Pageable pageable);

    List<Product> findByIsFeaturedTrueAndActiveTrue();

    Page<Product> findByIsFeaturedTrueAndActiveTrue(Pageable pageable);

    List<Product> findByCategory_IdAndActiveTrue(Long categoryId);

    Page<Product> findByCategory_IdAndActiveTrue(Long categoryId, Pageable pageable);

    Page<Product> findByCategory_NameIgnoreCaseAndActiveTrue(String categoryName, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.active = true AND (p.stockQuantity <= 0 OR p.stockQuantity <= p.lowStockThreshold)")
    List<Product> findLowStockProducts();

    @Query("SELECT p FROM Product p WHERE p.active = true AND p.id <> :currentId AND p.category.id = :categoryId")
    List<Product> findRelatedProductsByCategoryId(@Param("currentId") String currentId, @Param("categoryId") Long categoryId, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.active = true AND p.id <> :currentId AND p.category IS NOT NULL AND LOWER(p.category.name) = LOWER(:categoryName)")
    List<Product> findRelatedProductsByCategoryName(@Param("currentId") String currentId, @Param("categoryName") String categoryName, Pageable pageable);

    @Query("""
        SELECT p FROM Product p
        WHERE p.active = true
          AND (:categoryId IS NULL OR p.category.id = :categoryId)
          AND (:keyword IS NULL OR :keyword = ''
               OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR LOWER(p.badge) LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR LOWER(p.tag) LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR (p.category IS NOT NULL AND LOWER(p.category.name) LIKE LOWER(CONCAT('%', :keyword, '%'))))
    """)
    Page<Product> searchProducts(
        @Param("categoryId") Long categoryId,
        @Param("keyword") String keyword,
        Pageable pageable
    );

    @Query("""
        SELECT p FROM Product p
        WHERE p.active = true
          AND (LOWER(p.name) LIKE LOWER(CONCAT('%', :term, '%'))
               OR LOWER(p.description) LIKE LOWER(CONCAT('%', :term, '%'))
               OR LOWER(p.badge) LIKE LOWER(CONCAT('%', :term, '%'))
               OR LOWER(p.tag) LIKE LOWER(CONCAT('%', :term, '%'))
               OR (p.category IS NOT NULL AND LOWER(p.category.name) LIKE LOWER(CONCAT('%', :term, '%'))))
    """)
    Page<Product> searchActive(@Param("term") String term, Pageable pageable);
}
