package com.example.hebekery.dto;

import com.example.hebekery.model.OrderItem;

public class OrderItemResponse {
    private Long id;
    private String productId;
    private String productName;
    private String imageUrl;
    private double price;
    private double costAtSale;
    private int quantity;
    private double total;

    public OrderItemResponse() {
    }

    public static OrderItemResponse from(OrderItem item) {
        if (item == null) {
            return null;
        }
        OrderItemResponse dto = new OrderItemResponse();
        dto.setId(item.getId());
        dto.setProductId(item.getProductId());
        dto.setProductName(item.getProductName());
        dto.setImageUrl(item.getImageUrl());
        dto.setPrice(item.getPrice());
        dto.setCostAtSale(item.getCostAtSale());
        dto.setQuantity(item.getQuantity());
        dto.setTotal(item.getTotal());
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
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

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public double getCostAtSale() {
        return costAtSale;
    }

    public void setCostAtSale(double costAtSale) {
        this.costAtSale = costAtSale;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public double getTotal() {
        return total;
    }

    public void setTotal(double total) {
        this.total = total;
    }
}
