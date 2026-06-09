package com.example.hebekery.repository;

import com.example.hebekery.model.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
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

    @Query("""
            select o from Order o
            where (:keyword is null or :keyword = ''
                or lower(o.id) like lower(concat('%', :keyword, '%'))
                or lower(o.customerName) like lower(concat('%', :keyword, '%'))
                or lower(o.phone) like lower(concat('%', :keyword, '%'))
                or lower(o.orderStatus) like lower(concat('%', :keyword, '%')))
            and (:orderStatus is null or :orderStatus = '' or o.orderStatus = :orderStatus)
            and (:paymentMethod is null or :paymentMethod = '' or o.paymentMethod = :paymentMethod)
            and (:dateFrom is null or o.createdAt >= :dateFrom)
            and (:dateTo is null or o.createdAt < :dateTo)
            """)
    Page<Order> search(
            @Param("keyword") String keyword,
            @Param("orderStatus") String orderStatus,
            @Param("paymentMethod") String paymentMethod,
            @Param("dateFrom") LocalDateTime dateFrom,
            @Param("dateTo") LocalDateTime dateTo,
            Pageable pageable
    );
}
