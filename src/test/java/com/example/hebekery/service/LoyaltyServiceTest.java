package com.example.hebekery.service;

import com.example.hebekery.dto.LoyaltySummaryResponse;
import com.example.hebekery.model.CustomerProfile;
import com.example.hebekery.model.LoyaltyTransaction;
import com.example.hebekery.model.Order;
import com.example.hebekery.repository.CustomerProfileRepository;
import com.example.hebekery.repository.LoyaltyTransactionRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LoyaltyServiceTest {

    @Mock
    private CustomerProfileRepository customerProfileRepository;

    @Mock
    private LoyaltyTransactionRepository loyaltyTransactionRepository;

    @InjectMocks
    private LoyaltyService loyaltyService;

    @Test
    @DisplayName("testAwardPointsForDeliveredOrder: Cộng điểm thành công theo tỷ lệ 2% cho thành viên SILVER")
    void testAwardPoints_SilverTier() {
        CustomerProfile profile = new CustomerProfile("PROF-1", "USR-1");
        profile.setMembershipTier("SILVER");
        profile.setLoyaltyPoints(20);
        profile.setTotalSpent(1500000.0);

        when(loyaltyTransactionRepository.findByOrderId("ORD-101")).thenReturn(Collections.emptyList());
        when(customerProfileRepository.findByUserId("USR-1")).thenReturn(Optional.of(profile));

        Order order = new Order();
        order.setId("ORD-101");
        order.setOrderCode("HBK-ORD-101");
        order.setUserId("USR-1");
        order.setSubtotal(500000.0);
        order.setTotal(500000.0);

        int earned = loyaltyService.awardPointsForDeliveredOrder(order);

        // 500,000 * 2% = 10,000 VND -> 10 points
        assertEquals(10, earned);
        assertEquals(30, profile.getLoyaltyPoints()); // 20 + 10
        assertEquals(2000000.0, profile.getTotalSpent());
        verify(customerProfileRepository, times(1)).save(profile);
        verify(loyaltyTransactionRepository, times(1)).save(any(LoyaltyTransaction.class));
    }

    @Test
    @DisplayName("testRedeemPoints: Trừ điểm thành công khi đủ số dư")
    void testRedeemPoints_Success() {
        CustomerProfile profile = new CustomerProfile("PROF-1", "USR-1");
        profile.setLoyaltyPoints(50);

        when(customerProfileRepository.findByUserId("USR-1")).thenReturn(Optional.of(profile));

        loyaltyService.redeemPointsForOrder("USR-1", "ORD-102", 20);

        assertEquals(30, profile.getLoyaltyPoints());
        verify(customerProfileRepository, times(1)).save(profile);
        verify(loyaltyTransactionRepository, times(1)).save(any(LoyaltyTransaction.class));
    }

    @Test
    @DisplayName("testRedeemPoints: Báo lỗi khi số điểm sử dụng vượt quá số dư hiện tại")
    void testRedeemPoints_InsufficientPoints() {
        CustomerProfile profile = new CustomerProfile("PROF-1", "USR-1");
        profile.setLoyaltyPoints(10);

        when(customerProfileRepository.findByUserId("USR-1")).thenReturn(Optional.of(profile));

        assertThrows(IllegalArgumentException.class, () -> {
            loyaltyService.redeemPointsForOrder("USR-1", "ORD-103", 25);
        });
        verify(customerProfileRepository, never()).save(profile);
    }

    @Test
    @DisplayName("testRefundPoints: Hoàn trả điểm khi đơn hàng bị hủy")
    void testRefundPoints_Success() {
        CustomerProfile profile = new CustomerProfile("PROF-1", "USR-1");
        profile.setLoyaltyPoints(15);

        when(customerProfileRepository.findByUserId("USR-1")).thenReturn(Optional.of(profile));

        loyaltyService.refundPointsForOrder("USR-1", "ORD-104", 10, "Khách đổi ý");

        assertEquals(25, profile.getLoyaltyPoints());
        verify(customerProfileRepository, times(1)).save(profile);
        verify(loyaltyTransactionRepository, times(1)).save(any(LoyaltyTransaction.class));
    }

    @Test
    @DisplayName("testGetLoyaltySummary: Tính toán chính xác ngưỡng thăng hạng và tiến độ %")
    void testGetLoyaltySummary() {
        CustomerProfile profile = new CustomerProfile("PROF-1", "USR-1");
        profile.setMembershipTier("SILVER");
        profile.setLoyaltyPoints(40);
        profile.setTotalSpent(1500000.0);

        when(customerProfileRepository.findByUserId("USR-1")).thenReturn(Optional.of(profile));

        LoyaltySummaryResponse summary = loyaltyService.getLoyaltySummary("USR-1");

        assertNotNull(summary);
        assertEquals("SILVER", summary.getMembershipTier());
        assertEquals(40, summary.getLoyaltyPoints());
        assertEquals(40000, summary.getPointValueVnd());
        assertEquals("Bánh Mộc", summary.getNextTierName());
        assertEquals(3000000.0, summary.getNextTierThreshold());
        assertEquals(1500000.0, summary.getAmountToNextTier());
        assertEquals(50, summary.getProgressPercent()); // 1.5M / 3M = 50%
    }
}
