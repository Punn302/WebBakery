package com.example.hebekery.service;

import com.example.hebekery.dto.LoyaltySummaryResponse;
import com.example.hebekery.dto.LoyaltyTransactionResponse;
import com.example.hebekery.model.CustomerProfile;
import com.example.hebekery.model.LoyaltyTransaction;
import com.example.hebekery.model.Order;
import com.example.hebekery.repository.CustomerProfileRepository;
import com.example.hebekery.repository.LoyaltyTransactionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class LoyaltyService {

    private static final Logger log = LoggerFactory.getLogger(LoyaltyService.class);

    private final CustomerProfileRepository customerProfileRepository;
    private final LoyaltyTransactionRepository loyaltyTransactionRepository;

    public LoyaltyService(CustomerProfileRepository customerProfileRepository,
                          LoyaltyTransactionRepository loyaltyTransactionRepository) {
        this.customerProfileRepository = customerProfileRepository;
        this.loyaltyTransactionRepository = loyaltyTransactionRepository;
    }

    @Transactional
    public CustomerProfile getOrCreateProfile(String userId) {
        return customerProfileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    CustomerProfile newProfile = new CustomerProfile("PROF-" + UUID.randomUUID(), userId);
                    newProfile.setCreatedAt(LocalDateTime.now());
                    newProfile.setUpdatedAt(LocalDateTime.now());
                    return customerProfileRepository.save(newProfile);
                });
    }

    public LoyaltySummaryResponse getLoyaltySummary(String userId) {
        CustomerProfile profile = getOrCreateProfile(userId);
        return LoyaltySummaryResponse.from(profile);
    }

    public Page<LoyaltyTransactionResponse> getTransactions(String userId, Pageable pageable) {
        return loyaltyTransactionRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(LoyaltyTransactionResponse::from);
    }

    public List<LoyaltyTransactionResponse> getRecentTransactions(String userId) {
        return loyaltyTransactionRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(LoyaltyTransactionResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public void redeemPointsForOrder(String userId, String orderId, int pointsToUse) {
        if (pointsToUse <= 0) return;

        CustomerProfile profile = getOrCreateProfile(userId);
        if (profile.getLoyaltyPoints() < pointsToUse) {
            throw new IllegalArgumentException("Số điểm hiện tại (" + profile.getLoyaltyPoints() + " điểm) không đủ để trừ " + pointsToUse + " điểm");
        }

        profile.deductPoints(pointsToUse);
        customerProfileRepository.save(profile);

        LoyaltyTransaction tx = new LoyaltyTransaction(
                "LTX-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(),
                userId,
                orderId,
                "REDEEM_CHECKOUT",
                -pointsToUse,
                profile.getLoyaltyPoints(),
                "Dùng " + pointsToUse + " Điểm Lành trừ vào đơn hàng " + orderId
        );
        loyaltyTransactionRepository.save(tx);
        log.info("Khách hàng {} đã dùng {} điểm cho đơn hàng {}. Số dư còn lại: {}", userId, pointsToUse, orderId, profile.getLoyaltyPoints());
    }

    @Transactional
    public int awardPointsForDeliveredOrder(Order order) {
        if (order == null || order.getUserId() == null) return 0;

        // Prevent duplicate awarding
        List<LoyaltyTransaction> existingTx = loyaltyTransactionRepository.findByOrderId(order.getId());
        boolean alreadyAwarded = existingTx.stream().anyMatch(t -> "EARN_PURCHASE".equalsIgnoreCase(t.getTransactionType()));
        if (alreadyAwarded || order.getPointsEarned() > 0) {
            log.info("Đơn hàng {} đã được tích điểm trước đó, bỏ qua để tránh trùng lặp.", order.getId());
            return order.getPointsEarned();
        }

        CustomerProfile profile = getOrCreateProfile(order.getUserId());
        double spendingBase = order.getSubtotal() > 0 ? order.getSubtotal() : order.getTotal();
        double rate = profile.getEarnRate();
        int earnedPoints = (int) Math.floor((spendingBase * rate) / 1000.0);
        if (earnedPoints < 1 && spendingBase >= 30000.0) {
            earnedPoints = 1;
        }

        profile.addSpendingAndPoints(order.getTotal(), earnedPoints);
        customerProfileRepository.save(profile);

        LoyaltyTransaction tx = new LoyaltyTransaction(
                "LTX-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(),
                order.getUserId(),
                order.getId(),
                "EARN_PURCHASE",
                earnedPoints,
                profile.getLoyaltyPoints(),
                "Tích " + earnedPoints + " Điểm Lành từ đơn hàng " + (order.getOrderCode() != null ? order.getOrderCode() : order.getId()) + " (" + (int)(rate * 100) + "% hạng " + profile.getMembershipTier() + ")"
        );
        loyaltyTransactionRepository.save(tx);

        order.setPointsEarned(earnedPoints);
        log.info("Đã cộng {} điểm cho khách hàng {} từ đơn {}. Hạng mới: {}, Tổng điểm: {}", earnedPoints, order.getUserId(), order.getId(), profile.getMembershipTier(), profile.getLoyaltyPoints());
        return earnedPoints;
    }

    @Transactional
    public void refundPointsForOrder(String userId, String orderId, int points, String reason) {
        if (points <= 0) return;

        CustomerProfile profile = getOrCreateProfile(userId);
        profile.setLoyaltyPoints(profile.getLoyaltyPoints() + points);
        customerProfileRepository.save(profile);

        LoyaltyTransaction tx = new LoyaltyTransaction(
                "LTX-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(),
                userId,
                orderId,
                "CANCEL_REFUND",
                points,
                profile.getLoyaltyPoints(),
                "Hoàn trả " + points + " Điểm Lành do hủy đơn " + orderId + (reason != null ? ": " + reason : "")
        );
        loyaltyTransactionRepository.save(tx);
        log.info("Đã hoàn {} điểm cho user {} do hủy đơn {}", points, userId, orderId);
    }
}
