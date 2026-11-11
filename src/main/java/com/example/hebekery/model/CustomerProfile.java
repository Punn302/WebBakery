package com.example.hebekery.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "customer_profiles")
public class CustomerProfile extends BaseEntity {

    @Id
    private String id;

    @Column(name = "user_id", nullable = false, unique = true, length = 64)
    private String userId;

    @Column(name = "loyalty_points", nullable = false)
    private int loyaltyPoints = 0;

    @Column(name = "membership_tier", nullable = false, length = 32)
    private String membershipTier = "BRONZE";

    @Column(name = "total_spent", nullable = false)
    private double totalSpent = 0.0;

    @Column(name = "target_calories")
    private Integer targetCalories = 2000;

    public CustomerProfile() {
    }

    public CustomerProfile(String id, String userId) {
        this.id = id;
        this.userId = userId;
        this.loyaltyPoints = 0;
        this.membershipTier = "BRONZE";
        this.totalSpent = 0.0;
        this.targetCalories = 2000;
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

    public int getLoyaltyPoints() {
        return loyaltyPoints;
    }

    public void setLoyaltyPoints(int loyaltyPoints) {
        this.loyaltyPoints = loyaltyPoints;
    }

    public String getMembershipTier() {
        return membershipTier;
    }

    public void setMembershipTier(String membershipTier) {
        this.membershipTier = membershipTier;
    }

    public double getTotalSpent() {
        return totalSpent;
    }

    public void setTotalSpent(double totalSpent) {
        this.totalSpent = totalSpent;
    }

    public Integer getTargetCalories() {
        return targetCalories;
    }

    public void setTargetCalories(Integer targetCalories) {
        this.targetCalories = targetCalories;
    }

    public double getEarnRate() {
        return switch (this.membershipTier) {
            case "DIAMOND" -> 0.05;
            case "GOLD" -> 0.03;
            case "SILVER" -> 0.02;
            default -> 0.01;
        };
    }

    public String getTierDisplayName() {
        return switch (this.membershipTier) {
            case "DIAMOND" -> "Hebe Diamond";
            case "GOLD" -> "Bánh Mộc (Gold)";
            case "SILVER" -> "Hạt Lành (Silver)";
            default -> "Mầm Xanh (Bronze)";
        };
    }

    public double getNextTierThreshold() {
        return switch (this.membershipTier) {
            case "DIAMOND" -> 7000000.0;
            case "GOLD" -> 7000000.0;
            case "SILVER" -> 3000000.0;
            default -> 1000000.0;
        };
    }

    public String getNextTierName() {
        return switch (this.membershipTier) {
            case "DIAMOND" -> "Cấp tối đa";
            case "GOLD" -> "Hebe Diamond";
            case "SILVER" -> "Bánh Mộc";
            default -> "Hạt Lành";
        };
    }

    public void addSpending(double amount) {
        this.totalSpent += amount;
        recalculateTier();
    }

    public void addSpendingAndPoints(double amount, int points) {
        this.totalSpent += amount;
        this.loyaltyPoints += points;
        recalculateTier();
    }

    public void deductPoints(int points) {
        this.loyaltyPoints = Math.max(0, this.loyaltyPoints - points);
    }

    public void recalculateTier() {
        if (this.totalSpent >= 7000000) {
            this.membershipTier = "DIAMOND";
        } else if (this.totalSpent >= 3000000) {
            this.membershipTier = "GOLD";
        } else if (this.totalSpent >= 1000000) {
            this.membershipTier = "SILVER";
        } else {
            this.membershipTier = "BRONZE";
        }
    }
}
