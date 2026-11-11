package com.example.hebekery.dto;

import com.example.hebekery.model.LoyaltyTransaction;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

@Schema(description = "Lịch sử biến động Điểm Lành HeBekery")
public class LoyaltyTransactionResponse {

    private String id;
    private String userId;
    private String orderId;
    private String transactionType;
    private String transactionTypeName;
    private int points;
    private int balanceAfter;
    private String description;
    private LocalDateTime createdAt;

    public LoyaltyTransactionResponse() {
    }

    public static LoyaltyTransactionResponse from(LoyaltyTransaction tx) {
        LoyaltyTransactionResponse res = new LoyaltyTransactionResponse();
        res.setId(tx.getId());
        res.setUserId(tx.getUserId());
        res.setOrderId(tx.getOrderId());
        res.setTransactionType(tx.getTransactionType());
        res.setPoints(tx.getPoints());
        res.setBalanceAfter(tx.getBalanceAfter());
        res.setDescription(tx.getDescription());
        res.setCreatedAt(tx.getCreatedAt());

        String typeName = switch (tx.getTransactionType()) {
            case "EARN_PURCHASE" -> "Tích điểm đơn hàng";
            case "REDEEM_CHECKOUT" -> "Trừ điểm mua hàng";
            case "BIRTHDAY_GIFT" -> "Quà tặng sinh nhật";
            case "CANCEL_REFUND" -> "Hoàn điểm hủy đơn";
            case "ADMIN_ADJUST" -> "Điều chỉnh hệ thống";
            default -> tx.getTransactionType();
        };
        res.setTransactionTypeName(typeName);
        return res;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public String getTransactionType() {
        return transactionType;
    }

    public void setTransactionType(String transactionType) {
        this.transactionType = transactionType;
    }

    public String getTransactionTypeName() {
        return transactionTypeName;
    }

    public void setTransactionTypeName(String transactionTypeName) {
        this.transactionTypeName = transactionTypeName;
    }

    public int getPoints() {
        return points;
    }

    public void setPoints(int points) {
        this.points = points;
    }

    public int getBalanceAfter() {
        return balanceAfter;
    }

    public void setBalanceAfter(int balanceAfter) {
        this.balanceAfter = balanceAfter;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
