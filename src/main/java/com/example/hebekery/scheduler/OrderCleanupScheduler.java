package com.example.hebekery.scheduler;

import com.example.hebekery.model.Order;
import com.example.hebekery.model.OrderStatusHistory;
import com.example.hebekery.repository.OrderRepository;
import com.example.hebekery.repository.OrderStatusHistoryRepository;
import com.example.hebekery.service.LoyaltyService;
import com.example.hebekery.service.VoucherService;
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
    private final LoyaltyService loyaltyService;
    private final VoucherService voucherService;

    public OrderCleanupScheduler(OrderRepository orderRepository,
                                 OrderStatusHistoryRepository orderStatusHistoryRepository,
                                 LoyaltyService loyaltyService,
                                 VoucherService voucherService) {
        this.orderRepository = orderRepository;
        this.orderStatusHistoryRepository = orderStatusHistoryRepository;
        this.loyaltyService = loyaltyService;
        this.voucherService = voucherService;
    }

    /**
     * Tự động quét và hủy các đơn hàng VietQR chưa thanh toán quá 15 phút.
     * Chạy định kỳ mỗi 5 phút (300.000 ms).
     */
    @Scheduled(fixedRate = 300000)
    @Transactional
    public void cleanupExpiredVietQrOrders() {
        LocalDateTime expirationThreshold = LocalDateTime.now().minusMinutes(15);

        List<Order> expiredOrders = orderRepository.findExpiredPaymentOrders(expirationThreshold);

        if (!expiredOrders.isEmpty()) {
            log.info("Xử lý {} đơn hàng quá hạn thanh toán.", expiredOrders.size());
            for (Order order : expiredOrders) {
                order.setOrderStatus("CANCELLED");
                orderRepository.save(order);

                // Hoàn lại điểm thưởng nếu khách hàng đã dùng điểm khi đặt đơn
                if (order.getPointsUsed() > 0 && order.getUserId() != null) {
                    try {
                        loyaltyService.refundPointsForOrder(order.getUserId(), order.getId(), order.getPointsUsed(), "Tự động hủy do quá hạn thanh toán");
                    } catch (Exception e) {
                        log.error("Lỗi khi hoàn trả điểm cho đơn hàng {}: {}", order.getId(), e.getMessage());
                    }
                }

                // Phục hồi lượt sử dụng voucher nếu đơn hàng có áp dụng mã giảm giá
                if (order.getVoucherCode() != null && !order.getVoucherCode().isBlank()) {
                    try {
                        voucherService.restoreVoucherUsage(order.getVoucherCode(), order.getId());
                    } catch (Exception e) {
                        log.error("Lỗi khi phục hồi voucher cho đơn hàng {}: {}", order.getId(), e.getMessage());
                    }
                }

                orderStatusHistoryRepository.save(new OrderStatusHistory(
                        order.getId(),
                        "CANCELLED",
                        order.getPaymentStatus(),
                        "Hệ thống tự động hủy đơn do quá hạn 15 phút thanh toán VietQR",
                        "SYSTEM"
                ));

                log.info("Đã cập nhật trạng thái đơn hàng hết hạn thanh toán: ID={}, Mã={}", order.getId(), order.getOrderCode());
            }
        }
    }
}
