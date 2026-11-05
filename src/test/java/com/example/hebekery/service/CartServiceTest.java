package com.example.hebekery.service;

import com.example.hebekery.dto.request.SyncCartItemDto;
import com.example.hebekery.model.CartItem;
import com.example.hebekery.model.Product;
import com.example.hebekery.model.User;
import com.example.hebekery.repository.CartItemRepository;
import com.example.hebekery.repository.ProductRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CartServiceTest {

    @Mock
    private CartItemRepository cartItemRepository;

    @Mock
    private UserService userService;

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private CartService cartService;

    @Test
    @DisplayName("Khách chưa đăng nhập: getCartItems trả về danh sách rỗng (Stateless)")
    void getCartItems_whenNotLoggedIn_returnsEmpty() {
        when(userService.isLoggedIn()).thenReturn(false);

        List<CartItem> items = cartService.getCartItems();

        assertTrue(items.isEmpty());
        verify(cartItemRepository, never()).findByUserId(any());
    }

    @Test
    @DisplayName("Khách đã đăng nhập: addToCart thêm vào CSDL")
    void addToCart_whenLoggedIn_persistsToDb() {
        User user = new User("user-1", "user@test.vn", "123", "User A", "0912");
        when(userService.isLoggedIn()).thenReturn(true);
        when(userService.getCurrentUser()).thenReturn(user);

        Product product = new Product("P001", "Granola", "Ngu coc", "Mo ta", 100000, "url", "badge");
        when(cartItemRepository.findByUserIdAndProductId("user-1", "P001")).thenReturn(Optional.empty());

        cartService.addToCart(product, 2);

        verify(cartItemRepository, times(1)).save(any(CartItem.class));
    }

    @Test
    @DisplayName("testAddToCart_MergeQuantity: Thêm sản phẩm đã có trong giỏ -> tăng số lượng chính xác")
    void testAddToCart_MergeQuantity() {
        User user = new User("user-1", "user@test.vn", "123", "User A", "0912");
        when(userService.isLoggedIn()).thenReturn(true);
        when(userService.getCurrentUser()).thenReturn(user);

        Product product = new Product("P001", "Granola", "Ngu coc", "Mo ta", 100000, "url", "badge");
        CartItem existingItem = new CartItem("user-1", product, 3);

        when(cartItemRepository.findByUserIdAndProductId("user-1", "P001")).thenReturn(Optional.of(existingItem));

        cartService.addToCart(product, 2);

        assertEquals(5, existingItem.getQuantity());
        verify(cartItemRepository).save(existingItem);
    }

    @Test
    @DisplayName("testCalculateTotalPrice: Tính đúng tổng tiền của tất cả mặt hàng trong giỏ")
    void testCalculateTotalPrice() {
        User user = new User("user-1", "user@test.vn", "123", "User A", "0912");
        when(userService.isLoggedIn()).thenReturn(true);
        when(userService.getCurrentUser()).thenReturn(user);

        Product p1 = new Product("P001", "Granola", "Ngu coc", "Mo ta", 100000.0, "url", "badge");
        Product p2 = new Product("P002", "Biscotti", "Banh", "Mo ta", 65000.0, "url", "badge");

        CartItem item1 = new CartItem("user-1", p1, 2); // 200,000
        CartItem item2 = new CartItem("user-1", p2, 1); // 65,000

        when(cartItemRepository.findByUserId("user-1")).thenReturn(List.of(item1, item2));

        double total = cartService.getTotalPrice();

        assertEquals(265000.0, total);
    }

    @Test
    @DisplayName("testUpdateQuantity: Cập nhật số lượng mới cho sản phẩm trong giỏ")
    void testUpdateQuantity() {
        User user = new User("user-1", "user@test.vn", "123", "User A", "0912");
        when(userService.isLoggedIn()).thenReturn(true);
        when(userService.getCurrentUser()).thenReturn(user);

        Product product = new Product("P001", "Granola", "Ngu coc", "Mo ta", 100000, "url", "badge");
        CartItem existing = new CartItem("user-1", product, 2);

        when(cartItemRepository.findByUserIdAndProductId("user-1", "P001")).thenReturn(Optional.of(existing));

        cartService.updateQuantity("P001", 4);

        assertEquals(4, existing.getQuantity());
        verify(cartItemRepository).save(existing);
    }

    @Test
    @DisplayName("testRemoveFromCart: Xóa sản phẩm khỏi giỏ hàng thành công")
    void testRemoveFromCart() {
        User user = new User("user-1", "user@test.vn", "123", "User A", "0912");
        when(userService.isLoggedIn()).thenReturn(true);
        when(userService.getCurrentUser()).thenReturn(user);

        cartService.removeFromCart("P001");

        verify(cartItemRepository).deleteByUserIdAndProductId("user-1", "P001");
    }

    @Test
    @DisplayName("testClearCart: Làm rỗng toàn bộ giỏ hàng của người dùng")
    void testClearCart() {
        User user = new User("user-1", "user@test.vn", "123", "User A", "0912");
        when(userService.isLoggedIn()).thenReturn(true);
        when(userService.getCurrentUser()).thenReturn(user);

        cartService.clearCart();

        verify(cartItemRepository).deleteByUserId("user-1");
    }

    @Test
    @DisplayName("Đồng bộ giỏ hàng (syncCart) từ LocalStorage vào CSDL thành công")
    void syncCart_mergesItemsCorrectly() {
        Product p1 = new Product("P001", "Granola", "Ngu coc", "Mo ta", 100000, "url", "badge");
        p1.setStockQuantity(50);
        p1.setActive(true);

        when(productRepository.findById("P001")).thenReturn(Optional.of(p1));
        when(cartItemRepository.findByUserIdAndProductId("user-1", "P001")).thenReturn(Optional.empty());

        cartService.syncCart("user-1", List.of(new SyncCartItemDto("P001", 3)));

        verify(cartItemRepository, times(1)).save(any(CartItem.class));
    }
}
