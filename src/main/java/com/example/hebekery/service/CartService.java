package com.example.hebekery.service;

import com.example.hebekery.dto.request.SyncCartItemDto;
import com.example.hebekery.model.CartItem;
import com.example.hebekery.model.Product;
import com.example.hebekery.model.User;
import com.example.hebekery.repository.CartItemRepository;
import com.example.hebekery.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final UserService userService;
    private final ProductRepository productRepository;

    public CartService(CartItemRepository cartItemRepository,
                       UserService userService,
                       ProductRepository productRepository) {
        this.cartItemRepository = cartItemRepository;
        this.userService = userService;
        this.productRepository = productRepository;
    }

    public int getQuantity(String productId) {
        if (!isLoggedIn()) {
            return 0;
        }
        return getCartItems().stream()
                .filter(item -> item.getProductId().equals(productId))
                .mapToInt(CartItem::getQuantity)
                .findFirst()
                .orElse(0);
    }

    @Transactional
    public void addToCart(Product product, int quantity) {
        if (!isLoggedIn()) {
            return;
        }
        String userId = userService.getCurrentUser().getId();
        Optional<CartItem> existing = cartItemRepository.findByUserIdAndProductId(userId, product.getId());
        if (existing.isPresent()) {
            CartItem item = existing.get();
            item.setQuantity(item.getQuantity() + quantity);
            cartItemRepository.save(item);
        } else {
            CartItem item = new CartItem(
                    product.getId(),
                    product.getName(),
                    product.getImageUrl(),
                    product.getPrice(),
                    quantity
            );
            item.setUserId(userId);
            cartItemRepository.save(item);
        }
    }

    @Transactional
    public void updateQuantity(String productId, int quantity) {
        if (!isLoggedIn()) {
            return;
        }
        String userId = userService.getCurrentUser().getId();
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }
        cartItemRepository.findByUserIdAndProductId(userId, productId).ifPresent(item -> {
            item.setQuantity(quantity);
            cartItemRepository.save(item);
        });
    }

    @Transactional
    public void removeFromCart(String productId) {
        if (!isLoggedIn()) {
            return;
        }
        String userId = userService.getCurrentUser().getId();
        cartItemRepository.deleteByUserIdAndProductId(userId, productId);
    }

    public List<CartItem> getCartItems() {
        if (!isLoggedIn()) {
            return Collections.emptyList();
        }
        return cartItemRepository.findByUserId(userService.getCurrentUser().getId());
    }

    public List<CartItem> getCartItems(String userId) {
        if (userId == null || userId.isBlank()) {
            return Collections.emptyList();
        }
        return cartItemRepository.findByUserId(userId);
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
        }
    }

    @Transactional
    public void clearCart(String userId) {
        if (userId != null && !userId.isBlank()) {
            cartItemRepository.deleteByUserId(userId);
        }
    }

    @Transactional
    public void syncCart(String userId, List<SyncCartItemDto> items) {
        if (userId == null || userId.isBlank() || items == null || items.isEmpty()) {
            return;
        }

        for (SyncCartItemDto dto : items) {
            if (dto.getProductId() == null || dto.getQuantity() <= 0) {
                continue;
            }

            Optional<Product> productOpt = productRepository.findById(dto.getProductId());
            if (productOpt.isEmpty() || !productOpt.get().isActive()) {
                continue;
            }

            Product product = productOpt.get();
            int validQuantity = Math.min(dto.getQuantity(), Math.max(product.getStockQuantity(), 1));

            Optional<CartItem> existing = cartItemRepository.findByUserIdAndProductId(userId, product.getId());
            if (existing.isPresent()) {
                CartItem item = existing.get();
                int newQty = Math.min(item.getQuantity() + validQuantity, Math.max(product.getStockQuantity(), 1));
                item.setQuantity(newQty);
                cartItemRepository.save(item);
            } else {
                CartItem item = new CartItem(
                        product.getId(),
                        product.getName(),
                        product.getImageUrl(),
                        product.getPrice(),
                        validQuantity
                );
                item.setUserId(userId);
                cartItemRepository.save(item);
            }
        }
    }

    @Transactional
    public void saveCartForUser(User user) {
        // Stateless: Cart is automatically persisted to database for authenticated users
    }

    @Transactional
    public void mergeSessionCartForUser(User user) {
        // Stateless: Client synchronizes local storage cart via POST /api/cart/sync upon login
    }

    private boolean isLoggedIn() {
        return userService.isLoggedIn() && userService.getCurrentUser() != null;
    }
}
