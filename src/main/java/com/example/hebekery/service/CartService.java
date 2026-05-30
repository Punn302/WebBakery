package com.example.hebekery.service;

import com.example.hebekery.model.CartItem;
import com.example.hebekery.model.Product;
import com.example.hebekery.model.User;
import org.springframework.stereotype.Service;
import org.springframework.web.context.annotation.SessionScope;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@SessionScope
public class CartService {

    private List<CartItem> cartItems = new ArrayList<>();

    // Thêm sản phẩm vào giỏ
    public void addToCart(Product product, int quantity) {
        Optional<CartItem> existingItem = cartItems.stream()
                .filter(item -> item.getProductId().equals(product.getId()))
                .findFirst();

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + quantity);
        } else {
            cartItems.add(new CartItem(
                    product.getId(),
                    product.getName(),
                    product.getImageUrl(),
                    product.getPrice(),
                    quantity
            ));
        }
    }

    // Cập nhật số lượng
    public void updateQuantity(String productId, int quantity) {
        cartItems.stream()
                .filter(item -> item.getProductId().equals(productId))
                .findFirst()
                .ifPresent(item -> item.setQuantity(quantity));
    }

    // Xóa sản phẩm khỏi giỏ
    public void removeFromCart(String productId) {
        cartItems.removeIf(item -> item.getProductId().equals(productId));
    }

    // Lấy tất cả sản phẩm trong giỏ
    public List<CartItem> getCartItems() {
        return cartItems;
    }

    // Tính tổng tiền
    public double getTotalPrice() {
        return cartItems.stream()
                .mapToDouble(CartItem::getTotal)
                .sum();
    }

    // Đếm số lượng sản phẩm trong giỏ
    public int getCartCount() {
        return cartItems.stream()
                .mapToInt(CartItem::getQuantity)
                .sum();
    }

    // Xóa toàn bộ giỏ hàng
    public void clearCart() {
        cartItems.clear();
    }

    // Lưu giỏ hàng (khi đã đăng nhập)
    public void saveCartForUser(User user) {
        // Trong thực tế, lưu vào database
        System.out.println("Lưu giỏ hàng cho user: " + user.getEmail());
        System.out.println("Giỏ hàng có " + cartItems.size() + " sản phẩm");
    }
}