package com.example.hebekery.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "products")
public class Product {
    @Id
    private String id;
    @Column(nullable = false)
    private String name;
    @Column(nullable = false)
    private String category;
    @Column(length = 1000)
    private String description;
    private double price;
    private String imageUrl;
    private String badge;
    private String tag;
    private int stockQuantity;
    private int lowStockThreshold = 5;
    private double averageCost;
    @Column(nullable = false)
    private boolean active = true;

    public Product() {
    }

    public Product(String id, String name, String category, String description,
                   double price, String imageUrl, String badge) {
        this(id, name, category, description, price, imageUrl, badge, "");
    }

    public Product(String id, String name, String category, String description,
                   double price, String imageUrl, String badge, String tag) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.description = description;
        this.price = price;
        this.imageUrl = imageUrl;
        this.badge = badge;
        this.tag = tag;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public String getBadge() { return badge; }
    public void setBadge(String badge) { this.badge = badge; }
    public String getTag() { return tag; }
    public void setTag(String tag) { this.tag = tag; }
    public int getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(int stockQuantity) { this.stockQuantity = stockQuantity; }
    public int getLowStockThreshold() { return lowStockThreshold; }
    public void setLowStockThreshold(int lowStockThreshold) { this.lowStockThreshold = lowStockThreshold; }
    public double getAverageCost() { return averageCost; }
    public void setAverageCost(double averageCost) { this.averageCost = averageCost; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public boolean isOutOfStock() { return stockQuantity <= 0; }
    public boolean isLowStock() { return stockQuantity > 0 && stockQuantity <= lowStockThreshold; }
}
