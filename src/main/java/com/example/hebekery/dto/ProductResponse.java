package com.example.hebekery.dto;

import com.example.hebekery.model.Product;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Thông tin chi tiết sản phẩm bánh")
public class ProductResponse {

    @Schema(description = "Mã SKU hoặc định danh sản phẩm", example = "P001")
    private String id;

    @Schema(description = "Tên sản phẩm", example = "Bánh Mì Nguyên Cám Hạt Óc Chó")
    private String name;

    @Schema(description = "ID danh mục sản phẩm", example = "1")
    private Long categoryId;

    @Schema(description = "Tên danh mục sản phẩm", example = "Bánh Mì Healthy")
    private String category;

    @Schema(description = "Mô tả chi tiết và thành phần dinh dưỡng", example = "Bánh mì nguyên cám 100% tự nhiên không đường tinh luyện...")
    private String description;

    @Schema(description = "Giá bán niêm yết (VNĐ)", example = "65000.0")
    private double price;

    @Schema(description = "Đường dẫn ảnh đại diện sản phẩm (Cloudinary CDN)", example = "https://res.cloudinary.com/hebekery/image/upload/v1/products/banh-mi.jpg")
    private String imageUrl;

    @Schema(description = "Huy hiệu nổi bật (Best Seller, Mới, Healthy)", example = "Best Seller")
    private String badge;

    @Schema(description = "Thẻ phân loại phụ (Keto, Eat Clean, Không đường)", example = "Eat Clean")
    private String tag;

    @Schema(description = "Số lượng tồn kho thực tế", example = "45")
    private int stockQuantity;

    @Schema(description = "Ngưỡng cảnh báo tồn kho thấp", example = "10")
    private int lowStockThreshold;

    @Schema(description = "Giá vốn bình quân gia quyền (WAC) phục vụ tính lợi nhuận", example = "35000.0")
    private double averageCost;

    @Schema(description = "Trạng thái đang kinh doanh", example = "true")
    private boolean active;

    @Schema(description = "Sản phẩm có hiển thị ở mục nổi bật trang chủ không", example = "true")
    private boolean isFeatured;

    @Schema(description = "Trạng thái hết hàng (tồn <= 0)", example = "false")
    private boolean outOfStock;

    @Schema(description = "Trạng thái sắp hết hàng (tồn <= ngưỡng)", example = "false")
    private boolean lowStock;

    public ProductResponse() {
    }

    public static ProductResponse from(Product product) {
        if (product == null) {
            return null;
        }
        ProductResponse response = new ProductResponse();
        response.setId(product.getId());
        response.setName(product.getName());
        response.setCategory(product.getCategoryName());
        if (product.getCategory() != null) {
            response.setCategoryId(product.getCategory().getId());
        }
        response.setDescription(product.getDescription());
        response.setPrice(product.getPrice());
        response.setImageUrl(product.getImageUrl());
        response.setBadge(product.getBadge());
        response.setTag(product.getTag());
        response.setStockQuantity(product.getStockQuantity());
        response.setLowStockThreshold(product.getLowStockThreshold());
        response.setAverageCost(product.getAverageCost());
        response.setActive(product.isActive());
        response.setFeatured(product.isFeatured());
        response.setOutOfStock(product.isOutOfStock());
        response.setLowStock(product.isLowStock());
        return response;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getBadge() {
        return badge;
    }

    public void setBadge(String badge) {
        this.badge = badge;
    }

    public String getTag() {
        return tag;
    }

    public void setTag(String tag) {
        this.tag = tag;
    }

    public int getStockQuantity() {
        return stockQuantity;
    }

    public void setStockQuantity(int stockQuantity) {
        this.stockQuantity = stockQuantity;
    }

    public int getLowStockThreshold() {
        return lowStockThreshold;
    }

    public void setLowStockThreshold(int lowStockThreshold) {
        this.lowStockThreshold = lowStockThreshold;
    }

    public double getAverageCost() {
        return averageCost;
    }

    public void setAverageCost(double averageCost) {
        this.averageCost = averageCost;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public boolean isFeatured() {
        return isFeatured;
    }

    public void setFeatured(boolean featured) {
        isFeatured = featured;
    }

    public boolean isOutOfStock() {
        return outOfStock;
    }

    public void setOutOfStock(boolean outOfStock) {
        this.outOfStock = outOfStock;
    }

    public boolean isLowStock() {
        return lowStock;
    }

    public void setLowStock(boolean lowStock) {
        this.lowStock = lowStock;
    }
}
