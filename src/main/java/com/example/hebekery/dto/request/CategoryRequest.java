package com.example.hebekery.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Yêu cầu tạo mới hoặc chỉnh sửa danh mục sản phẩm")
public class CategoryRequest {

    @Schema(description = "Tên danh mục", example = "Bánh Ngọt Không Đường")
    @NotBlank(message = "Tên danh mục không được để trống")
    @Size(max = 100, message = "Tên danh mục tối đa 100 ký tự")
    private String name;

    @Schema(description = "Slug tùy chỉnh (nếu để trống hệ thống sẽ tự sinh từ tên)", example = "banh-ngot-khong-duong")
    @Size(max = 100, message = "Slug tối đa 100 ký tự")
    private String slug;

    @Schema(description = "Mô tả ngắn gọn về danh mục", example = "Dành riêng cho người ăn kiêng, tiểu đường")
    @Size(max = 500, message = "Mô tả tối đa 500 ký tự")
    private String description;

    @Schema(description = "Trạng thái kích hoạt", example = "true")
    private Boolean active = true;

    public CategoryRequest() {
    }

    public CategoryRequest(String name, String slug, String description, Boolean active) {
        this.name = name;
        this.slug = slug;
        this.description = description;
        this.active = active;
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

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}
