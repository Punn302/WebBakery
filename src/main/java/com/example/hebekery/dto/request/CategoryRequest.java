package com.example.hebekery.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CategoryRequest {

    @NotBlank(message = "Tên danh mục không được để trống")
    @Size(max = 100, message = "Tên danh mục tối đa 100 ký tự")
    private String name;

    @Size(max = 100, message = "Slug tối đa 100 ký tự")
    private String slug;

    @Size(max = 500, message = "Mô tả tối đa 500 ký tự")
    private String description;

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
