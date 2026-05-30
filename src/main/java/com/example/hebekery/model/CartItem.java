package com.example.hebekery.model;

public class CartItem {
    private String productId;
    private String productName;
    private String imageUrl;
    private double price;
    private int quantity;
    private double total;

    public CartItem() {}

    public CartItem(String productId, String productName, String imageUrl, double price, int quantity) {
        this.productId = productId;
        this.productName = productName;
        this.imageUrl = imageUrl;
        this.price = price;
        this.quantity = quantity;
        this.total = price * quantity;
    }

    // Getters and Setters
    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) {
        this.quantity = quantity;
        this.total = this.price * quantity;
    }

    public double getTotal() { return total; }
    public void setTotal(double total) { this.total = total; }
}