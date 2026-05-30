package com.example.hebekery.dto;

import com.example.hebekery.model.CartItem;

import java.util.List;

public class CartResponse {
    private List<CartItem> items;
    private double totalPrice;
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
