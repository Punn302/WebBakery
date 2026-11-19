package com.example.hebekery.repository;

import com.example.hebekery.model.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, String> {

    @EntityGraph(attributePaths = {"items"})
    List<Order> findByUserId(String userId);

    @EntityGraph(attributePaths = {"items"})
    List<Order> findByPhone(String phone);

    @EntityGraph(attributePaths = {"items"})
    Optional<Order> findByOrderCode(String orderCode);

    @EntityGraph(attributePaths = {"items"})
    Optional<Order> findWithItemsById(String id);

    List<Order> findByPaymentStatusAndCreatedAtBefore(String paymentStatus, LocalDateTime cutoff);

    List<Order> findByOrderStatusAndCreatedAtBefore(String orderStatus, LocalDateTime cutoff);

    @Query("""
            select o from Order o
            where (o.paymentMethod in ('VIETQR'))
              and (o.paymentStatus in ('PENDING', 'AWAITING_PAYMENT'))
              and (o.orderStatus in ('PENDING', 'AWAITING_PAYMENT'))
              and (o.createdAt < :cutoff)
            """)
    List<Order> findExpiredPaymentOrders(@Param("cutoff") LocalDateTime cutoff);

    @Query("""
            select o from Order o
            where (:keyword is null or :keyword = ''
                or lower(o.id) like lower(concat('%', :keyword, '%'))
                or (o.orderCode is not null and lower(o.orderCode) like lower(concat('%', :keyword, '%')))
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
