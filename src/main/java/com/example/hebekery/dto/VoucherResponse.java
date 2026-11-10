package com.example.hebekery.dto;

import com.example.hebekery.model.Voucher;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

@Schema(description = "Thông tin chi tiết mã giảm giá / voucher Hebekery")
public class VoucherResponse {

    private String id;
    private String code;
    private String discountType; // PERCENTAGE, FIXED_AMOUNT, FREE_SHIPPING
    private double discountValue;
    private Double maxDiscount;
    private double minOrderAmount;
    private int usageLimit;
    private int usedCount;
    private int userLimit;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private boolean active;

    public VoucherResponse() {
    }

    public static VoucherResponse from(Voucher v) {
        if (v == null) return null;
        VoucherResponse res = new VoucherResponse();
        res.setId(v.getId());
        res.setCode(v.getCode());
        res.setDiscountType(v.getDiscountType());
        res.setDiscountValue(v.getDiscountValue());
        res.setMaxDiscount(v.getMaxDiscount());
        res.setMinOrderAmount(v.getMinOrderAmount());
        res.setUsageLimit(v.getUsageLimit());
        res.setUsedCount(v.getUsedCount());
        res.setUserLimit(v.getUserLimit());
        res.setStartDate(v.getStartDate());
        res.setEndDate(v.getEndDate());
        res.setActive(v.isActive());
        return res;
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
}
