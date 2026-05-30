package com.example.hebekery.dto.request;

import jakarta.validation.constraints.NotBlank;

public class RemoveCartItemRequest {
    @NotBlank(message = "Ma san pham khong duoc de trong")
    private String productId;

    public String getProductId() {
        return productId;
    }

    public void setProductId(String productId) {
        this.productId = productId;
    }
}
