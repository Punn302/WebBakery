package com.example.hebekery.controller;

import com.example.hebekery.dto.ApiResponse;
import com.example.hebekery.dto.CartResponse;
import com.example.hebekery.dto.request.AddToCartRequest;
import com.example.hebekery.dto.request.RemoveCartItemRequest;
import com.example.hebekery.dto.request.SyncCartRequest;
import com.example.hebekery.dto.request.UpdateCartRequest;
import com.example.hebekery.model.Product;
import com.example.hebekery.service.CartService;
import com.example.hebekery.service.ProductService;
import com.example.hebekery.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cart")
@Tag(name = "Cart Management", description = "Quản lý giỏ hàng, cập nhật số lượng và đồng bộ giỏ hàng cho người dùng")
public class CartController {

    private final CartService cartService;
    private final ProductService productService;
    private final UserService userService;

    public CartController(CartService cartService, ProductService productService, UserService userService) {
        this.cartService = cartService;
        this.productService = productService;
        this.userService = userService;
    }

    @Operation(summary = "Thêm sản phẩm vào giỏ hàng", description = "Thêm sản phẩm với số lượng chỉ định (yêu cầu đăng nhập)", security = @SecurityRequirement(name = "BearerAuth"))
    @PostMapping("/add")
    public ResponseEntity<ApiResponse<CartResponse>> addToCart(@Valid @RequestBody AddToCartRequest request) {
        if (!userService.isLoggedIn()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.failure("Vui lòng đăng nhập để lưu giỏ hàng trực tuyến hoặc quản lý qua LocalStorage"));
        }
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

    @Operation(summary = "Xem thông tin giỏ hàng", description = "Lấy danh sách các mặt hàng, tổng số lượng và tổng tiền trong giỏ")
    @GetMapping
    public ResponseEntity<ApiResponse<CartResponse>> getCart() {
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin giỏ hàng thành công", getCartData()));
    }

    @Operation(summary = "Đồng bộ giỏ hàng từ LocalStorage", description = "Đồng bộ các mặt hàng khách đã chọn trên trình duyệt vào tài khoản sau khi đăng nhập", security = @SecurityRequirement(name = "BearerAuth"))
    @PostMapping("/sync")
    public ResponseEntity<ApiResponse<CartResponse>> syncCart(@Valid @RequestBody SyncCartRequest request) {
        if (!userService.isLoggedIn()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.failure("Vui lòng đăng nhập để đồng bộ giỏ hàng"));
        }
        String userId = userService.getCurrentUser().getId();
        cartService.syncCart(userId, request.getItems());
        return ResponseEntity.ok(ApiResponse.success("Đồng bộ giỏ hàng thành công", getCartData()));
    }

    @Operation(summary = "Cập nhật số lượng sản phẩm", description = "Điều chỉnh số lượng của một sản phẩm trong giỏ hàng", security = @SecurityRequirement(name = "BearerAuth"))
    @PostMapping("/update")
    public ResponseEntity<ApiResponse<CartResponse>> updateCart(@Valid @RequestBody UpdateCartRequest request) {
        if (!userService.isLoggedIn()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.failure("Vui lòng đăng nhập để cập nhật giỏ hàng trực tuyến"));
        }
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

    @Operation(summary = "Xóa sản phẩm khỏi giỏ hàng", description = "Xóa hoàn toàn một sản phẩm khỏi giỏ hàng trực tuyến", security = @SecurityRequirement(name = "BearerAuth"))
    @PostMapping("/remove")
    public ResponseEntity<ApiResponse<CartResponse>> removeFromCart(@Valid @RequestBody RemoveCartItemRequest request) {
        if (!userService.isLoggedIn()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.failure("Vui lòng đăng nhập để xóa sản phẩm khỏi giỏ hàng trực tuyến"));
        }
        cartService.removeFromCart(request.getProductId());
        return ResponseEntity.ok(ApiResponse.success("Đã xóa sản phẩm khỏi giỏ hàng", getCartData()));
    }

    @Operation(summary = "Xóa toàn bộ giỏ hàng", description = "Làm rỗng giỏ hàng sau khi đặt hàng hoặc người dùng xóa giỏ", security = @SecurityRequirement(name = "BearerAuth"))
    @PostMapping("/clear")
    public ResponseEntity<ApiResponse<CartResponse>> clearCart() {
        if (!userService.isLoggedIn()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.failure("Vui lòng đăng nhập để làm rỗng giỏ hàng trực tuyến"));
        }
        cartService.clearCart();
        return ResponseEntity.ok(ApiResponse.success("Đã làm rỗng giỏ hàng", getCartData()));
    }

    private CartResponse getCartData() {
        return new CartResponse(
                cartService.getCartItems(),
                cartService.getTotalPrice(),
                cartService.getCartCount()
        );
    }
}
