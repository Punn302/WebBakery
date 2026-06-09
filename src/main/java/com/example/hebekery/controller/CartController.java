package com.example.hebekery.controller;

import com.example.hebekery.dto.CartResponse;
import com.example.hebekery.dto.request.AddToCartRequest;
import com.example.hebekery.dto.request.RemoveCartItemRequest;
import com.example.hebekery.dto.request.UpdateCartRequest;
import com.example.hebekery.model.Product;
import com.example.hebekery.service.CartService;
import com.example.hebekery.service.ProductService;
import com.example.hebekery.service.UserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
public class CartController {

    private final CartService cartService;
    private final ProductService productService;
    private final UserService userService;

    public CartController(CartService cartService, ProductService productService, UserService userService) {
        this.cartService = cartService;
        this.productService = productService;
        this.userService = userService;
    }

    @PostMapping("/api/cart/add")
    public Map<String, Object> addToCart(@Valid @RequestBody AddToCartRequest request) {
        Product product = productService.getProductById(request.getProductId());
        if (product == null) {
            return failure("San pham khong ton tai");
        }
        int requestedQuantity = cartService.getQuantity(product.getId()) + request.getQuantity();
        if (product.getStockQuantity() <= 0) {
            return failure("San pham da het hang");
        }
        if (requestedQuantity > product.getStockQuantity()) {
            return failure("Chi con " + product.getStockQuantity() + " san pham trong kho");
        }

        cartService.addToCart(product, request.getQuantity());

        Map<String, Object> response = success("Da them san pham vao gio hang");
        addCartFields(response);
        return response;
    }

    @GetMapping("/api/cart")
    public Map<String, Object> getCart() {
        Map<String, Object> response = success(null);
        addCartFields(response);
        return response;
    }

    @PostMapping("/api/cart/update")
    public Map<String, Object> updateCart(@Valid @RequestBody UpdateCartRequest request) {
        Product product = productService.getProductById(request.getProductId());
        if (product == null) {
            return failure("San pham khong ton tai");
        }
        if (product.getStockQuantity() <= 0) {
            return failure("San pham da het hang");
        }
        if (request.getQuantity() > product.getStockQuantity()) {
            return failure("Chi con " + product.getStockQuantity() + " san pham trong kho");
        }
        cartService.updateQuantity(request.getProductId(), request.getQuantity());

        Map<String, Object> response = success("Da cap nhat gio hang");
        addCartFields(response);
        return response;
    }

    @PostMapping("/api/cart/remove")
    public Map<String, Object> removeFromCart(@Valid @RequestBody RemoveCartItemRequest request) {
        cartService.removeFromCart(request.getProductId());

        Map<String, Object> response = success("Da xoa san pham khoi gio hang");
        addCartFields(response);
        return response;
    }

    @PostMapping("/api/cart/save")
    public Map<String, Object> saveCart() {
        if (userService.isLoggedIn()) {
            cartService.saveCartForUser(userService.getCurrentUser());
        }

        return success("Da luu gio hang");
    }

    private void addCartFields(Map<String, Object> response) {
        CartResponse cart = new CartResponse(cartService.getCartItems(), cartService.getTotalPrice(), cartService.getCartCount());
        response.put("items", cart.getItems());
        response.put("totalPrice", cart.getTotalPrice());
        response.put("cartCount", cart.getCartCount());
        response.put("cart", cart);
    }

    private Map<String, Object> success(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        if (message != null) {
            response.put("message", message);
        }
        return response;
    }

    private Map<String, Object> failure(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", message);
        return response;
    }
}
