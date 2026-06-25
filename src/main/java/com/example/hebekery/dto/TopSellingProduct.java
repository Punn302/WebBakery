package com.example.hebekery.dto;

public class TopSellingProduct {
    private final String productId;
    private final String productName;
    private final int quantity;
    private final double revenue;

    public TopSellingProduct(String productId, String productName, int quantity, double revenue) {
        this.productId = productId;
        this.productName = productName;
        this.quantity = quantity;
        this.revenue = revenue;
    }

    public String getProductId() {
        return productId;
    }

    public String getProductName() {
        return productName;
    }

    public int getQuantity() {
        return quantity;
    }

    public double getRevenue() {
        return revenue;
    }
}
