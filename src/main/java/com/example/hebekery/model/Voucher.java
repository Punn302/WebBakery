package com.example.hebekery.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "vouchers")
public class Voucher extends BaseEntity {

    @Id
    private String id;

    @Column(nullable = false, unique = true, length = 64)
    private String code;

    @Column(name = "discount_type", nullable = false, length = 32)
    private String discountType; // PERCENTAGE, FIXED_AMOUNT, FREE_SHIPPING

    @Column(name = "discount_value", nullable = false)
    private double discountValue;

    @Column(name = "max_discount")
    private Double maxDiscount;

    @Column(name = "min_order_amount")
    private double minOrderAmount = 0.0;

    @Column(name = "usage_limit")
    private int usageLimit = 100;

    @Column(name = "used_count")
    private int usedCount = 0;

    @Column(name = "user_limit")
    private int userLimit = 1;

    @Column(name = "start_date")
    private LocalDateTime startDate;

    @Column(name = "end_date")
    private LocalDateTime endDate;

    @Column(nullable = false)
    private boolean active = true;

    public Voucher() {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getDiscountType() {
        return discountType;
    }

    public void setDiscountType(String discountType) {
        this.discountType = discountType;
    }

    public double getDiscountValue() {
        return discountValue;
    }

    public void setDiscountValue(double discountValue) {
        this.discountValue = discountValue;
    }

    public Double getMaxDiscount() {
        return maxDiscount;
    }

    public void setMaxDiscount(Double maxDiscount) {
        this.maxDiscount = maxDiscount;
    }

    public double getMinOrderAmount() {
        return minOrderAmount;
    }

    public void setMinOrderAmount(double minOrderAmount) {
        this.minOrderAmount = minOrderAmount;
    }

    public int getUsageLimit() {
        return usageLimit;
    }

    public void setUsageLimit(int usageLimit) {
        this.usageLimit = usageLimit;
    }

    public int getUsedCount() {
        return usedCount;
    }

    public void setUsedCount(int usedCount) {
        this.usedCount = usedCount;
    }

    public int getUserLimit() {
        return userLimit;
    }

    public void setUserLimit(int userLimit) {
        this.userLimit = userLimit;
    }

    public LocalDateTime getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }

    public LocalDateTime getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDateTime endDate) {
        this.endDate = endDate;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public boolean isValidForOrder(double orderSubtotal) {
        if (!active) return false;
        LocalDateTime now = LocalDateTime.now();
        if (startDate != null && now.isBefore(startDate)) return false;
        if (endDate != null && now.isAfter(endDate)) return false;
        if (usageLimit > 0 && usedCount >= usageLimit) return false;
        return orderSubtotal >= minOrderAmount;
    }

    public double calculateDiscount(double orderSubtotal) {
        if (!isValidForOrder(orderSubtotal)) return 0.0;
        if ("PERCENTAGE".equalsIgnoreCase(discountType)) {
            double discount = orderSubtotal * (discountValue / 100.0);
            if (maxDiscount != null && maxDiscount > 0) {
                discount = Math.min(discount, maxDiscount);
            }
            return discount;
        } else if ("FIXED_AMOUNT".equalsIgnoreCase(discountType)) {
            return Math.min(discountValue, orderSubtotal);
        } else if ("FREE_SHIPPING".equalsIgnoreCase(discountType)) {
            return 30000.0; // Phí ship chuẩn 30k
        }
        return 0.0;
    }
}
