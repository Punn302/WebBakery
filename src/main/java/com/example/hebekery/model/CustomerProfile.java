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

    public void addSpending(double amount) {
        this.totalSpent += amount;
        // 10,000 VND = 1 Point
        int earnedPoints = (int) (amount / 10000);
        this.loyaltyPoints += earnedPoints;

        // Upgrade tier
        if (this.totalSpent >= 5000000) {
            this.membershipTier = "GOLD";
        } else if (this.totalSpent >= 2000000) {
            this.membershipTier = "SILVER";
        }
    }
}
