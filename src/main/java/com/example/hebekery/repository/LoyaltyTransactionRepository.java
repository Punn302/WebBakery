package com.example.hebekery.repository;

import com.example.hebekery.model.LoyaltyTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LoyaltyTransactionRepository extends JpaRepository<LoyaltyTransaction, String> {

    List<LoyaltyTransaction> findByUserIdOrderByCreatedAtDesc(String userId);

    Page<LoyaltyTransaction> findByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);

    List<LoyaltyTransaction> findByOrderId(String orderId);
}
