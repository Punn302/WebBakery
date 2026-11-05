package com.example.hebekery.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public class SyncCartItemDto {

    @NotBlank(message = "Product ID không được để trống")
    private String productId;

    @Min(value = 1, message = "Số lượng phải lớn hơn hoặc bằng 1")
    private int quantity;

    public SyncCartItemDto() {
    }

    public SyncCartItemDto(String productId, int quantity) {
        this.productId = productId;
        this.quantity = quantity;
    }

    public String getProductId() {
        return productId;
    }

    public void setProductId(String productId) {
        this.productId = productId;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }
}
