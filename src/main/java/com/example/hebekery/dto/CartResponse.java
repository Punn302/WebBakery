package com.example.hebekery.dto;

import com.example.hebekery.model.CartItem;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

@Schema(description = "Phản hồi dữ liệu giỏ hàng")
public class CartResponse {

    @Schema(description = "Danh sách các mặt hàng trong giỏ")
    private List<CartItem> items;

    @Schema(description = "Tổng giá trị đơn hàng trong giỏ (VNĐ)", example = "130000.0")
    private double totalPrice;

    @Schema(description = "Tổng số lượng sản phẩm trong giỏ", example = "2")
    private int cartCount;

    public CartResponse() {
    }

    public CartResponse(List<CartItem> items, double totalPrice, int cartCount) {
        this.items = items;
        this.totalPrice = totalPrice;
        this.cartCount = cartCount;
    }

    public List<CartItem> getItems() {
        return items;
    }

    public void setItems(List<CartItem> items) {
        this.items = items;
    }

    public double getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(double totalPrice) {
        this.totalPrice = totalPrice;
    }

    public int getCartCount() {
        return cartCount;
    }

    public void setCartCount(int cartCount) {
        this.cartCount = cartCount;
    }
}
