package com.example.hebekery.dto;

import com.example.hebekery.model.Product;
import com.example.hebekery.model.ProductBatch;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Schema(description = "Thông tin chi tiết lô bánh và hạn sử dụng")
public class ProductBatchResponse {

    private String id;
    private String productId;
    private String productName;
    private String productImageUrl;
    private double originalPrice;
    private double discountedPrice;
    private String batchCode;
    private LocalDate manufactureDate;
    private LocalDate expiryDate;
    private int initialQuantity;
    private int currentQuantity;
    private String status; // ACTIVE, NEAR_EXPIRY, EXPIRED, SOLD_OUT
    private double discountPercent;
    private String note;
    private long daysRemaining;
    private String alertLevel; // SAFE (green), WARNING (yellow), DANGER (red)
    private LocalDateTime createdAt;

    public ProductBatchResponse() {
    }

    public static ProductBatchResponse from(ProductBatch batch, Product product) {
        ProductBatchResponse res = new ProductBatchResponse();
        res.setId(batch.getId());
        res.setProductId(batch.getProductId());
        res.setBatchCode(batch.getBatchCode());
        res.setManufactureDate(batch.getManufactureDate());
        res.setExpiryDate(batch.getExpiryDate());
        res.setInitialQuantity(batch.getInitialQuantity());
        res.setCurrentQuantity(batch.getCurrentQuantity());
        res.setStatus(batch.getStatus());
        res.setDiscountPercent(batch.getDiscountPercent());
        res.setNote(batch.getNote());
        res.setCreatedAt(batch.getCreatedAt());

        long days = ChronoUnit.DAYS.between(LocalDate.now(), batch.getExpiryDate());
        res.setDaysRemaining(days);

        if (days < 15 || "EXPIRED".equalsIgnoreCase(batch.getStatus())) {
            res.setAlertLevel("DANGER");
        } else if (days <= 30 || "NEAR_EXPIRY".equalsIgnoreCase(batch.getStatus())) {
            res.setAlertLevel("WARNING");
        } else {
            res.setAlertLevel("SAFE");
        }

        if (product != null) {
            res.setProductName(product.getName());
            res.setProductImageUrl(product.getImageUrl());
            res.setOriginalPrice(product.getPrice());
            if (batch.getDiscountPercent() > 0) {
                double discounted = product.getPrice() * (1.0 - (batch.getDiscountPercent() / 100.0));
                res.setDiscountedPrice(Math.round(discounted / 1000.0) * 1000.0);
            } else {
                res.setDiscountedPrice(product.getPrice());
            }
        }
        return res;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getProductId() {
        return productId;
    }

    public void setProductId(String productId) {
        this.productId = productId;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getProductImageUrl() {
        return productImageUrl;
    }

    public void setProductImageUrl(String productImageUrl) {
        this.productImageUrl = productImageUrl;
    }

    public double getOriginalPrice() {
        return originalPrice;
    }

    public void setOriginalPrice(double originalPrice) {
        this.originalPrice = originalPrice;
    }

    public double getDiscountedPrice() {
        return discountedPrice;
    }

    public void setDiscountedPrice(double discountedPrice) {
        this.discountedPrice = discountedPrice;
    }

    public String getBatchCode() {
        return batchCode;
    }

    public void setBatchCode(String batchCode) {
        this.batchCode = batchCode;
    }

    public LocalDate getManufactureDate() {
        return manufactureDate;
    }

    public void setManufactureDate(LocalDate manufactureDate) {
        this.manufactureDate = manufactureDate;
    }

    public LocalDate getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDate expiryDate) {
        this.expiryDate = expiryDate;
    }

    public int getInitialQuantity() {
        return initialQuantity;
    }

    public void setInitialQuantity(int initialQuantity) {
        this.initialQuantity = initialQuantity;
    }

    public int getCurrentQuantity() {
        return currentQuantity;
    }

    public void setCurrentQuantity(int currentQuantity) {
        this.currentQuantity = currentQuantity;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public double getDiscountPercent() {
        return discountPercent;
    }

    public void setDiscountPercent(double discountPercent) {
        this.discountPercent = discountPercent;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public long getDaysRemaining() {
        return daysRemaining;
    }

    public void setDaysRemaining(long daysRemaining) {
        this.daysRemaining = daysRemaining;
    }

    public String getAlertLevel() {
        return alertLevel;
    }

    public void setAlertLevel(String alertLevel) {
        this.alertLevel = alertLevel;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
