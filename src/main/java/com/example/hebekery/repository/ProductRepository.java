package com.example.hebekery.repository;

import com.example.hebekery.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ProductRepository extends JpaRepository<Product, String> {
    java.util.List<Product> findByActiveTrue();
    Page<Product> findByActiveTrue(Pageable pageable);
    Page<Product> findByCategoryAndActiveTrue(String category, Pageable pageable);
    @Query("select p from Product p where p.active = true and (lower(p.name) like lower(concat('%', :term, '%')) or lower(p.category) like lower(concat('%', :term, '%')) or lower(p.badge) like lower(concat('%', :term, '%')))")
    Page<Product> searchActive(String term, Pageable pageable);
}
