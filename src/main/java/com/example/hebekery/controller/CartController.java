package com.example.hebekery.controller;

import com.example.hebekery.dto.ApiResponse;
import com.example.hebekery.dto.CartResponse;
import com.example.hebekery.dto.request.AddToCartRequest;
import com.example.hebekery.dto.request.RemoveCartItemRequest;
import com.example.hebekery.dto.request.UpdateCartRequest;
import com.example.hebekery.model.Product;
import com.example.hebekery.service.CartService;
import com.example.hebekery.service.ProductService;
import com.example.hebekery.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;
    private final ProductService productService;
    private final UserService userService;

    public CartController(CartService cartService, ProductService productService, UserService userService) {
        this.cartService = cartService;
        this.productService = productService;
        this.userService = userService;
    }

    @PostMapping("/add")
    public ResponseEntity<ApiResponse<CartResponse>> addToCart(@Valid @RequestBody AddToCartRequest request) {
        Product product = productService.getProductById(request.getProductId());
        if (product == null) {
            return ResponseEntity.badRequest().body(ApiResponse.failure("Sản phẩm không tồn tại"));
        }
        int requestedQuantity = cartService.getQuantity(product.getId()) + request.getQuantity();
        if (product.getStockQuantity() <= 0) {
            return ResponseEntity.badRequest().body(ApiResponse.failure("Sản phẩm đã hết hàng"));
        }
        if (requestedQuantity > product.getStockQuantity()) {
            return ResponseEntity.badRequest().body(ApiResponse.failure("Chỉ còn " + product.getStockQuantity() + " sản phẩm trong kho"));
        }

        cartService.addToCart(product, request.getQuantity());

        return ResponseEntity.ok(ApiResponse.success("Đã thêm sản phẩm vào giỏ hàng", getCartData()));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<CartResponse>> getCart() {
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin giỏ hàng thành công", getCartData()));
    }

    @PostMapping("/update")
    public ResponseEntity<ApiResponse<CartResponse>> updateCart(@Valid @RequestBody UpdateCartRequest request) {
        Product product = productService.getProductById(request.getProductId());
        if (product == null) {
            return ResponseEntity.badRequest().body(ApiResponse.failure("Sản phẩm không tồn tại"));
        }
        if (product.getStockQuantity() <= 0) {
            return ResponseEntity.badRequest().body(ApiResponse.failure("Sản phẩm đã hết hàng"));
        }
        if (request.getQuantity() > product.getStockQuantity()) {
            return ResponseEntity.badRequest().body(ApiResponse.failure("Chỉ còn " + product.getStockQuantity() + " sản phẩm trong kho"));
        }
        cartService.updateQuantity(request.getProductId(), request.getQuantity());

        return ResponseEntity.ok(ApiResponse.success("Đã cập nhật giỏ hàng", getCartData()));
    }

    @PostMapping("/remove")
    public ResponseEntity<ApiResponse<CartResponse>> removeFromCart(@Valid @RequestBody RemoveCartItemRequest request) {
        cartService.removeFromCart(request.getProductId());
        return ResponseEntity.ok(ApiResponse.success("Đã xóa sản phẩm khỏi giỏ hàng", getCartData()));
    }

    @PostMapping("/save")
    public ResponseEntity<ApiResponse<Void>> saveCart() {
        if (userService.isLoggedIn()) {
            cartService.saveCartForUser(userService.getCurrentUser());
        }
        return ResponseEntity.ok(ApiResponse.success("Đã lưu giỏ hàng", null));
    }

    private CartResponse getCartData() {
        return new CartResponse(cartService.getCartItems(), cartService.getTotalPrice(), cartService.getCartCount());
    }
}
