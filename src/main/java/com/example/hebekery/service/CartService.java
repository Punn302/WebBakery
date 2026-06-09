package com.example.hebekery.service;

import com.example.hebekery.model.CartItem;
import com.example.hebekery.model.Product;
import com.example.hebekery.model.User;
import com.example.hebekery.repository.CartItemRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import org.springframework.web.context.annotation.SessionScope;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@SessionScope
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final UserService userService;
    private final List<CartItem> sessionCartItems = new ArrayList<>();

    public CartService(CartItemRepository cartItemRepository, UserService userService) {
        this.cartItemRepository = cartItemRepository;
        this.userService = userService;
    }

    public int getQuantity(String productId) {
        return getCartItems().stream()
                .filter(item -> item.getProductId().equals(productId))
                .mapToInt(CartItem::getQuantity)
                .findFirst()
                .orElse(0);
    }

    @Transactional
    public void addToCart(Product product, int quantity) {
        List<CartItem> items = getMutableCartItems();
        Optional<CartItem> existingItem = items.stream()
                .filter(item -> item.getProductId().equals(product.getId()))
                .findFirst();

        CartItem item;
        if (existingItem.isPresent()) {
            item = existingItem.get();
            item.setQuantity(item.getQuantity() + quantity);
        } else {
            item = new CartItem(
                    product.getId(),
                    product.getName(),
                    product.getImageUrl(),
                    product.getPrice(),
                    quantity
            );
            items.add(item);
        }
        saveIfLoggedIn(item);
    }

    @Transactional
    public void updateQuantity(String productId, int quantity) {
        getMutableCartItems().stream()
                .filter(item -> item.getProductId().equals(productId))
                .findFirst()
                .ifPresent(item -> {
                    item.setQuantity(quantity);
                    saveIfLoggedIn(item);
                });
    }

    @Transactional
    public void removeFromCart(String productId) {
        if (isLoggedIn()) {
            cartItemRepository.deleteByUserIdAndProductId(userService.getCurrentUser().getId(), productId);
            return;
        }
        sessionCartItems.removeIf(item -> item.getProductId().equals(productId));
    }

    public List<CartItem> getCartItems() {
        if (isLoggedIn()) {
            return cartItemRepository.findByUserId(userService.getCurrentUser().getId());
        }
        return sessionCartItems;
    }

    public double getTotalPrice() {
        return getCartItems().stream()
                .mapToDouble(CartItem::getTotal)
                .sum();
    }

    public int getCartCount() {
        return getCartItems().stream()
                .mapToInt(CartItem::getQuantity)
                .sum();
    }

    @Transactional
    public void clearCart() {
        if (isLoggedIn()) {
            cartItemRepository.deleteByUserId(userService.getCurrentUser().getId());
            return;
        }
        sessionCartItems.clear();
    }

    @Transactional
    public void saveCartForUser(User user) {
        mergeSessionCartForUser(user);
    }

    @Transactional
    public void mergeSessionCartForUser(User user) {
        if (user == null || sessionCartItems.isEmpty()) {
            return;
        }
        List<CartItem> savedItems = cartItemRepository.findByUserId(user.getId());
        for (CartItem sessionItem : sessionCartItems) {
            Optional<CartItem> existingItem = savedItems.stream()
                    .filter(item -> item.getProductId().equals(sessionItem.getProductId()))
                    .findFirst();
            if (existingItem.isPresent()) {
                CartItem item = existingItem.get();
                item.setQuantity(item.getQuantity() + sessionItem.getQuantity());
                cartItemRepository.save(item);
            } else {
                CartItem item = new CartItem(
                        sessionItem.getProductId(),
                        sessionItem.getProductName(),
                        sessionItem.getImageUrl(),
                        sessionItem.getPrice(),
                        sessionItem.getQuantity()
                );
                item.setUserId(user.getId());
                cartItemRepository.save(item);
            }
        }
        sessionCartItems.clear();
    }

    private List<CartItem> getMutableCartItems() {
        if (isLoggedIn()) {
            return cartItemRepository.findByUserId(userService.getCurrentUser().getId());
        }
        return sessionCartItems;
    }

    private void saveIfLoggedIn(CartItem item) {
        if (!isLoggedIn()) {
            return;
        }
        item.setUserId(userService.getCurrentUser().getId());
        cartItemRepository.save(item);
    }

    private boolean isLoggedIn() {
        return userService.isLoggedIn() && userService.getCurrentUser() != null;
    }
}
