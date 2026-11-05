package com.example.hebekery.scheduler;

import com.example.hebekery.model.Order;
import com.example.hebekery.model.OrderStatusHistory;
import com.example.hebekery.repository.OrderRepository;
import com.example.hebekery.repository.OrderStatusHistoryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class OrderCleanupScheduler {

    private static final Logger log = LoggerFactory.getLogger(OrderCleanupScheduler.class);

    private final OrderRepository orderRepository;
    private final OrderStatusHistoryRepository orderStatusHistoryRepository;

    public OrderCleanupScheduler(OrderRepository orderRepository,
                                 OrderStatusHistoryRepository orderStatusHistoryRepository) {
        this.orderRepository = orderRepository;
        this.orderStatusHistoryRepository = orderStatusHistoryRepository;
    }

    /**
     * Tự động quét và hủy các đơn hàng VietQR chưa thanh toán quá 15 phút.
     * Chạy định kỳ mỗi 5 phút (300.000 ms).
     */
    @Scheduled(fixedRate = 300000)
    @Transactional
    public void cleanupExpiredVietQrOrders() {
        LocalDateTime expirationThreshold = LocalDateTime.now().minusMinutes(15);

        List<Order> expiredOrders = orderRepository.findAll().stream()
                .filter(o -> "VIETQR".equalsIgnoreCase(o.getPaymentMethod()) || "MOMO".equalsIgnoreCase(o.getPaymentMethod()))
                .filter(o -> "PENDING".equalsIgnoreCase(o.getPaymentStatus()) || "AWAITING_PAYMENT".equalsIgnoreCase(o.getPaymentStatus()))
                .filter(o -> "PENDING".equalsIgnoreCase(o.getOrderStatus()) || "AWAITING_PAYMENT".equalsIgnoreCase(o.getOrderStatus()))
                .filter(o -> o.getCreatedAt() != null && o.getCreatedAt().isBefore(expirationThreshold))
                .toList();

        if (!expiredOrders.isEmpty()) {
            log.info("Phát hiện {} đơn hàng VietQR quá hạn 15 phút chưa thanh toán. Đang tiến hành hủy...", expiredOrders.size());
            for (Order order : expiredOrders) {
                order.setOrderStatus("CANCELLED");
                orderRepository.save(order);

                orderStatusHistoryRepository.save(new OrderStatusHistory(
                        order.getId(),
                        "CANCELLED",
                        order.getPaymentStatus(),
                        "Hệ thống tự động hủy đơn do quá hạn 15 phút thanh toán VietQR",
                        "SYSTEM"
                ));

                log.info("Đã hủy đơn hàng hết hạn: ID={}, Mã={}", order.getId(), order.getOrderCode());
            }
        }
    }
}
