package com.example.hebekery.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Mặt hàng đồng bộ từ giỏ hàng LocalStorage")
public class SyncCartItemDto {

    @Schema(description = "Mã sản phẩm", example = "P001")
    @NotBlank(message = "Mã sản phẩm không được để trống")
    private String productId;

    @Schema(description = "Số lượng", example = "2")
    @NotNull(message = "Số lượng không được null")
    @Min(value = 1, message = "Số lượng phải ít nhất là 1")
    private Integer quantity;

    public SyncCartItemDto() {
    }

    public SyncCartItemDto(String productId, Integer quantity) {
        this.productId = productId;
        this.quantity = quantity;
    }

    public String getProductId() {
        return productId;
    }

    public void setProductId(String productId) {
        this.productId = productId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}
