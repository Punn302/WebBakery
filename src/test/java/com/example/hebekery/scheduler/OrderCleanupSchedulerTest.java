package com.example.hebekery.scheduler;

import com.example.hebekery.model.Order;
import com.example.hebekery.model.OrderStatusHistory;
import com.example.hebekery.repository.OrderRepository;
import com.example.hebekery.repository.OrderStatusHistoryRepository;
import com.example.hebekery.service.LoyaltyService;
import com.example.hebekery.service.VoucherService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderCleanupSchedulerTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private OrderStatusHistoryRepository orderStatusHistoryRepository;

    @Mock
    private LoyaltyService loyaltyService;

    @Mock
    private VoucherService voucherService;

    @InjectMocks
    private OrderCleanupScheduler orderCleanupScheduler;

    @Test
    @DisplayName("cleanupExpiredVietQrOrders: Tự động hủy đơn VietQR quá hạn và hoàn lại điểm, phục hồi voucher")
    void cleanupExpiredVietQrOrders_success() {
        Order expiredOrder = new Order();
        expiredOrder.setId("ORD-EXPIRED");
        expiredOrder.setOrderCode("HBK-EXPIRED-01");
        expiredOrder.setPaymentMethod("VIETQR");
        expiredOrder.setPaymentStatus("PENDING");
        expiredOrder.setOrderStatus("PENDING");
        expiredOrder.setUserId("USR-100");
        expiredOrder.setPointsUsed(50);
        expiredOrder.setVoucherCode("HB10");
        expiredOrder.setCreatedAt(LocalDateTime.now().minusMinutes(20));

        when(orderRepository.findExpiredPaymentOrders(any(LocalDateTime.class))).thenReturn(List.of(expiredOrder));

        orderCleanupScheduler.cleanupExpiredVietQrOrders();

        assertEquals("CANCELLED", expiredOrder.getOrderStatus());
        verify(orderRepository, times(1)).save(expiredOrder);
        verify(loyaltyService, times(1)).refundPointsForOrder(eq("USR-100"), eq("ORD-EXPIRED"), eq(50), anyString());
        verify(voucherService, times(1)).restoreVoucherUsage(eq("HB10"), eq("ORD-EXPIRED"));
        verify(orderStatusHistoryRepository, times(1)).save(any(OrderStatusHistory.class));
    }

    @Test
    @DisplayName("cleanupExpiredVietQrOrders: Không làm gì khi không có đơn nào quá hạn")
    void cleanupExpiredVietQrOrders_noExpired() {
        when(orderRepository.findExpiredPaymentOrders(any(LocalDateTime.class))).thenReturn(Collections.emptyList());

        orderCleanupScheduler.cleanupExpiredVietQrOrders();

        verify(orderRepository, never()).save(any());
        verify(loyaltyService, never()).refundPointsForOrder(anyString(), anyString(), anyInt(), anyString());
        verify(voucherService, never()).restoreVoucherUsage(anyString(), anyString());
        verify(orderStatusHistoryRepository, never()).save(any());
    }
}
