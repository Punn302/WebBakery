package com.example.hebekery.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Yêu cầu cập nhật số lượng sản phẩm trong giỏ hàng")
public class UpdateCartRequest {

    @Schema(description = "Mã sản phẩm", example = "P001")
    @NotBlank(message = "Mã sản phẩm không được để trống")
    private String productId;

    @Schema(description = "Số lượng cập nhật mới", example = "3")
    @Min(value = 1, message = "Số lượng phải lớn hơn 0")
    @Max(value = 99, message = "Số lượng không được vượt quá 99")
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
