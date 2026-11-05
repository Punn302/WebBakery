package com.example.hebekery.dto;

import com.example.hebekery.model.Category;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

@Schema(description = "Thông tin danh mục sản phẩm")
public class CategoryResponse {

    @Schema(description = "Mã định danh danh mục", example = "1")
    private Long id;

    @Schema(description = "Tên danh mục bánh", example = "Bánh Mì Healthy")
    private String name;

    @Schema(description = "Chuỗi định danh URL (Slug)", example = "banh-mi-healthy")
    private String slug;

    @Schema(description = "Mô tả danh mục", example = "Các dòng bánh mì nguyên cám, yến mạch không chất bảo quản")
    private String description;

    @Schema(description = "Trạng thái hoạt động", example = "true")
    private boolean active;

    @Schema(description = "Thời điểm tạo danh mục", example = "2026-11-05T10:00:00")
    private LocalDateTime createdAt;

    @Schema(description = "Thời điểm cập nhật danh mục lần cuối", example = "2026-11-05T10:00:00")
    private LocalDateTime updatedAt;

    @Schema(description = "Người tạo danh mục", example = "admin@hebekery.vn")
    private String createdBy;

    @Schema(description = "Người cập nhật lần cuối", example = "admin@hebekery.vn")
    private String updatedBy;

    public CategoryResponse() {
    }

    public static CategoryResponse fromEntity(Category category) {
        if (category == null) {
            return null;
        }
        CategoryResponse response = new CategoryResponse();
        response.setId(category.getId());
        response.setName(category.getName());
        response.setSlug(category.getSlug());
        response.setDescription(category.getDescription());
        response.setActive(category.isActive());
        response.setCreatedAt(category.getCreatedAt());
        response.setUpdatedAt(category.getUpdatedAt());
        response.setCreatedBy(category.getCreatedBy());
        response.setUpdatedBy(category.getUpdatedBy());
        return response;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public String getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(String updatedBy) {
        this.updatedBy = updatedBy;
    }
}
