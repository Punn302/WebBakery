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
    private String tag;  // ← Thêm trường tag mới

    // Constructor mặc định
    public Product() {}

    // Constructor 7 tham số (giữ lại để tương thích cũ)
    public Product(String id, String name, String category, String description,
                   double price, String imageUrl, String badge) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.description = description;
        this.price = price;
        this.imageUrl = imageUrl;
        this.badge = badge;
        this.tag = "";  // tag mặc định rỗng
    }

    // Constructor 8 tham số (thêm tag)
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

    // Getters and Setters
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
}
