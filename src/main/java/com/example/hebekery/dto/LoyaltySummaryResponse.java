package com.example.hebekery.dto;

import com.example.hebekery.model.CustomerProfile;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Tổng quan thông tin điểm thưởng và hạng thành viên VVIP")
public class LoyaltySummaryResponse {

    private String userId;
    private int loyaltyPoints;
    private String membershipTier;
    private String tierDisplayName;
    private double earnRate; // 0.01 = 1%, 0.02 = 2%, etc.
    private int earnPercent; // 1, 2, 3, 5
    private double totalSpent;
    private double nextTierThreshold;
    private String nextTierName;
    private double amountToNextTier;
    private int progressPercent;
    private int pointValueVnd; // points * 1000

    public LoyaltySummaryResponse() {
    }

    public static LoyaltySummaryResponse from(CustomerProfile profile) {
        LoyaltySummaryResponse res = new LoyaltySummaryResponse();
        res.setUserId(profile.getUserId());
        res.setLoyaltyPoints(profile.getLoyaltyPoints());
        res.setMembershipTier(profile.getMembershipTier());
        res.setTierDisplayName(profile.getTierDisplayName());
        res.setEarnRate(profile.getEarnRate());
        res.setEarnPercent((int) (profile.getEarnRate() * 100));
        res.setTotalSpent(profile.getTotalSpent());
        res.setPointValueVnd(profile.getLoyaltyPoints() * 1000);

        double threshold = profile.getNextTierThreshold();
        res.setNextTierThreshold(threshold);
        res.setNextTierName(profile.getNextTierName());

        if ("DIAMOND".equalsIgnoreCase(profile.getMembershipTier())) {
            res.setAmountToNextTier(0.0);
            res.setProgressPercent(100);
        } else {
            double remaining = Math.max(0.0, threshold - profile.getTotalSpent());
            res.setAmountToNextTier(remaining);
            int progress = (int) Math.min(100, Math.round((profile.getTotalSpent() / threshold) * 100));
            res.setProgressPercent(progress);
        }
        return res;
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

    public String getTierDisplayName() {
        return tierDisplayName;
    }

    public void setTierDisplayName(String tierDisplayName) {
        this.tierDisplayName = tierDisplayName;
    }

    public double getEarnRate() {
        return earnRate;
    }

    public void setEarnRate(double earnRate) {
        this.earnRate = earnRate;
    }

    public int getEarnPercent() {
        return earnPercent;
    }

    public void setEarnPercent(int earnPercent) {
        this.earnPercent = earnPercent;
    }

    public double getTotalSpent() {
        return totalSpent;
    }

    public void setTotalSpent(double totalSpent) {
        this.totalSpent = totalSpent;
    }

    public double getNextTierThreshold() {
        return nextTierThreshold;
    }

    public void setNextTierThreshold(double nextTierThreshold) {
        this.nextTierThreshold = nextTierThreshold;
    }

    public String getNextTierName() {
        return nextTierName;
    }

    public void setNextTierName(String nextTierName) {
        this.nextTierName = nextTierName;
    }

    public double getAmountToNextTier() {
        return amountToNextTier;
    }

    public void setAmountToNextTier(double amountToNextTier) {
        this.amountToNextTier = amountToNextTier;
    }

    public int getProgressPercent() {
        return progressPercent;
    }

    public void setProgressPercent(int progressPercent) {
        this.progressPercent = progressPercent;
    }

    public int getPointValueVnd() {
        return pointValueVnd;
    }

    public void setPointValueVnd(int pointValueVnd) {
        this.pointValueVnd = pointValueVnd;
    }
}
