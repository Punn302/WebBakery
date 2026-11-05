package com.example.hebekery.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Yêu cầu tạo mới hoặc cập nhật sản phẩm")
public class ProductRequest {

    @Schema(description = "Mã SKU hoặc định danh sản phẩm (bắt buộc khi tạo mới)", example = "P018")
    private String id;

    @Schema(description = "Tên sản phẩm bánh", example = "Bánh Mì Lúa Mạch Đen Men Tự Nhiên")
    @NotBlank(message = "Tên sản phẩm không được để trống")
    private String name;

    @Schema(description = "ID danh mục sản phẩm", example = "1")
    private Long categoryId;

    @Schema(description = "Tên danh mục sản phẩm (tương thích ngược)", example = "Bánh Mì Healthy")
    private String category;

    @Schema(description = "Mô tả sản phẩm, thành phần dinh dưỡng và công dụng", example = "Bánh mì sourdough lúa mạch đen lên men chậm...")
    private String description;

    @Schema(description = "Giá bán niêm yết (VNĐ)", example = "75000.0")
    @Min(value = 0, message = "Giá sản phẩm phải lớn hơn hoặc bằng 0")
    private double price;

    @Schema(description = "Đường dẫn ảnh Cloudinary", example = "https://res.cloudinary.com/hebekery/image/upload/v1/products/sourdough.jpg")
    private String imageUrl;

    @Schema(description = "Huy hiệu hiển thị (Mới, Bán chạy, Giảm giá)", example = "Mới")
    private String badge;

    @Schema(description = "Thẻ phân loại phụ", example = "Sourdough")
    private String tag;

    @Schema(description = "Số lượng tồn kho ban đầu", example = "50")
    @Min(value = 0, message = "Số lượng tồn kho không được âm")
    private int stockQuantity;

    @Schema(description = "Ngưỡng cảnh báo sắp hết hàng", example = "5")
    @Min(value = 0, message = "Ngưỡng cảnh báo sắp hết hàng không được âm")
    private int lowStockThreshold = 5;

    @Schema(description = "Giá vốn bình quân ban đầu (WAC)", example = "40000.0")
    private double averageCost;

    @Schema(description = "Trạng thái kinh doanh", example = "true")
    private boolean active = true;

    @Schema(description = "Hiển thị ở mục nổi bật trang chủ", example = "false")
    private Boolean isFeatured = false;

    public ProductRequest() {
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

    public Boolean getFeatured() {
        return isFeatured;
    }

    public void setFeatured(Boolean featured) {
        isFeatured = featured;
    }
}
