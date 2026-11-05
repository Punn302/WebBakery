package com.example.hebekery.controller;

import com.example.hebekery.dto.ApiResponse;
import com.example.hebekery.dto.CartResponse;
import com.example.hebekery.dto.request.AddToCartRequest;
import com.example.hebekery.dto.request.RemoveCartItemRequest;
import com.example.hebekery.dto.request.SyncCartItemDto;
import com.example.hebekery.dto.request.SyncCartRequest;
import com.example.hebekery.dto.request.UpdateCartRequest;
import com.example.hebekery.model.CartItem;
import com.example.hebekery.model.Product;
import com.example.hebekery.model.User;
import com.example.hebekery.service.CartService;
import com.example.hebekery.service.ProductService;
import com.example.hebekery.service.UserService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CartControllerTest {

    @Mock
    private CartService cartService;

    @Mock
    private ProductService productService;

    @Mock
    private UserService userService;

    @InjectMocks
    private CartController cartController;

    @Test
    @DisplayName("addToCart: Báo lỗi 401 Unauthorized khi người dùng chưa đăng nhập")
    void addToCart_notLoggedIn() {
        when(userService.isLoggedIn()).thenReturn(false);

        AddToCartRequest request = new AddToCartRequest();
        request.setProductId("P001");
        request.setQuantity(2);

        ResponseEntity<ApiResponse<CartResponse>> response = cartController.addToCart(request);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertFalse(response.getBody().isSuccess());
        verify(cartService, never()).addToCart(any(), anyInt());
    }

    @Test
    @DisplayName("addToCart: Báo lỗi 400 Bad Request khi sản phẩm hết hàng tồn kho")
    void addToCart_outOfStock() {
        when(userService.isLoggedIn()).thenReturn(true);

        Product product = new Product("P001", "Bánh Mì", "Banh", "Mo ta", 50000, "url", "badge");
        product.setStockQuantity(0);

        when(productService.getProductById("P001")).thenReturn(product);

        AddToCartRequest request = new AddToCartRequest();
        request.setProductId("P001");
        request.setQuantity(1);

        ResponseEntity<ApiResponse<CartResponse>> response = cartController.addToCart(request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertFalse(response.getBody().isSuccess());
        verify(cartService, never()).addToCart(any(), anyInt());
    }

    @Test
    @DisplayName("addToCart: Thêm thành công sản phẩm vào giỏ khi tồn kho đủ")
    void addToCart_success() {
        when(userService.isLoggedIn()).thenReturn(true);

        Product product = new Product("P001", "Bánh Mì", "Banh", "Mo ta", 50000, "url", "badge");
        product.setStockQuantity(20);

        when(productService.getProductById("P001")).thenReturn(product);
        when(cartService.getQuantity("P001")).thenReturn(0);
        when(cartService.getCartItems()).thenReturn(List.of(new CartItem("USR-1", product, 2)));
        when(cartService.getTotalPrice()).thenReturn(100000.0);
        when(cartService.getCartCount()).thenReturn(2);

        AddToCartRequest request = new AddToCartRequest();
        request.setProductId("P001");
        request.setQuantity(2);

        ResponseEntity<ApiResponse<CartResponse>> response = cartController.addToCart(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        verify(cartService).addToCart(product, 2);
    }

    @Test
    @DisplayName("syncCart: Đồng bộ giỏ hàng từ LocalStorage thành công khi đã đăng nhập")
    void syncCart_success() {
        User user = new User("USR-1", "user@test.com", "pass", "User A", "0912");
        when(userService.isLoggedIn()).thenReturn(true);
        when(userService.getCurrentUser()).thenReturn(user);

        SyncCartRequest request = new SyncCartRequest(List.of(new SyncCartItemDto("P001", 3)));

        ResponseEntity<ApiResponse<CartResponse>> response = cartController.syncCart(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        verify(cartService).syncCart(eq("USR-1"), any());
    }

    @Test
    @DisplayName("clearCart: Làm rỗng giỏ hàng trực tuyến thành công")
    void clearCart_success() {
        when(userService.isLoggedIn()).thenReturn(true);

        ResponseEntity<ApiResponse<CartResponse>> response = cartController.clearCart();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        verify(cartService).clearCart();
    }
}
