package com.example.hebekery.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public class UpdateCartRequest {
    @NotBlank(message = "Ma san pham khong duoc de trong")
    private String productId;

    @Min(value = 1, message = "So luong phai lon hon 0")
    @Max(value = 99, message = "So luong khong duoc vuot qua 99")
    private int quantity;

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
