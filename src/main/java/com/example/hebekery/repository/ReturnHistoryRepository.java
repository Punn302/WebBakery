package com.example.hebekery.repository;

import com.example.hebekery.model.ReturnHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReturnHistoryRepository extends JpaRepository<ReturnHistory, Long> {
    List<ReturnHistory> findByOrderIdOrderByCreatedAtAsc(String orderId);
}
