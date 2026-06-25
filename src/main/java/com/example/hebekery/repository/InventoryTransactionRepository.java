package com.example.hebekery.repository;

import com.example.hebekery.model.InventoryTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InventoryTransactionRepository extends JpaRepository<InventoryTransaction, Long> {
    List<InventoryTransaction> findByProductIdOrderByCreatedAtDesc(String productId);
    boolean existsByProductId(String productId);
}
