package com.example.hebekery.scheduler;

import com.example.hebekery.model.Order;
import com.example.hebekery.model.OrderStatusHistory;
import com.example.hebekery.repository.OrderRepository;
import com.example.hebekery.repository.OrderStatusHistoryRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderCleanupSchedulerTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private OrderStatusHistoryRepository orderStatusHistoryRepository;

    @InjectMocks
    private OrderCleanupScheduler orderCleanupScheduler;

    @Test
    @DisplayName("cleanupExpiredVietQrOrders: Tự động hủy các đơn VietQR quá hạn 15 phút")
    void cleanupExpiredVietQrOrders_success() {
        Order expiredOrder = new Order();
        expiredOrder.setId("ORD-EXPIRED");
        expiredOrder.setPaymentMethod("VIETQR");
        expiredOrder.setPaymentStatus("PENDING");
        expiredOrder.setOrderStatus("PENDING");
        expiredOrder.setCreatedAt(LocalDateTime.now().minusMinutes(20)); // Tạo 20 phút trước

        Order recentOrder = new Order();
        recentOrder.setId("ORD-RECENT");
        recentOrder.setPaymentMethod("VIETQR");
        recentOrder.setPaymentStatus("PENDING");
        recentOrder.setOrderStatus("PENDING");
        recentOrder.setCreatedAt(LocalDateTime.now().minusMinutes(5)); // Mới tạo 5 phút trước

        Order paidOrder = new Order();
        paidOrder.setId("ORD-PAID");
        paidOrder.setPaymentMethod("VIETQR");
        paidOrder.setPaymentStatus("PAID");
        paidOrder.setOrderStatus("PROCESSING");
        paidOrder.setCreatedAt(LocalDateTime.now().minusMinutes(30));

        when(orderRepository.findAll()).thenReturn(List.of(expiredOrder, recentOrder, paidOrder));

        orderCleanupScheduler.cleanupExpiredVietQrOrders();

        // Chỉ đơn quá hạn bị hủy
        assertEquals("CANCELLED", expiredOrder.getOrderStatus());
        assertEquals("PENDING", recentOrder.getOrderStatus());
        assertEquals("PROCESSING", paidOrder.getOrderStatus());

        verify(orderRepository, times(1)).save(expiredOrder);
        verify(orderStatusHistoryRepository, times(1)).save(any(OrderStatusHistory.class));
    }

    @Test
    @DisplayName("cleanupExpiredVietQrOrders: Không làm gì khi không có đơn nào quá hạn")
    void cleanupExpiredVietQrOrders_noExpired() {
        Order recentOrder = new Order();
        recentOrder.setId("ORD-RECENT");
        recentOrder.setPaymentMethod("VIETQR");
        recentOrder.setPaymentStatus("PENDING");
        recentOrder.setOrderStatus("PENDING");
        recentOrder.setCreatedAt(LocalDateTime.now().minusMinutes(2));

        when(orderRepository.findAll()).thenReturn(List.of(recentOrder));

        orderCleanupScheduler.cleanupExpiredVietQrOrders();

        verify(orderRepository, never()).save(any());
        verify(orderStatusHistoryRepository, never()).save(any());
    }
}
