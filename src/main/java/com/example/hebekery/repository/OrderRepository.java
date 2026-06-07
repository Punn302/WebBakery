package com.example.hebekery.repository;

import com.example.hebekery.model.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, String> {
    List<Order> findByUserId(String userId);
    List<Order> findByPhone(String phone);
    Page<Order> findByIdContainingIgnoreCaseOrCustomerNameContainingIgnoreCaseOrPhoneContainingIgnoreCaseOrOrderStatusContainingIgnoreCase(
            String id,
            String customerName,
            String phone,
            String orderStatus,
            Pageable pageable
    );
}
