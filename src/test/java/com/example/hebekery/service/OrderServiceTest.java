package com.example.hebekery.service;

import com.example.hebekery.config.SepayConfig;
import com.example.hebekery.dto.CheckoutResponse;
import com.example.hebekery.dto.request.CheckoutRequest;
import com.example.hebekery.model.CartItem;
import com.example.hebekery.model.Order;
import com.example.hebekery.model.OrderItem;
import com.example.hebekery.model.Product;
import com.example.hebekery.model.User;
import com.example.hebekery.repository.OrderRepository;
import com.example.hebekery.repository.OrderStatusHistoryRepository;
import com.example.hebekery.repository.ReturnHistoryRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyDouble;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private OrderStatusHistoryRepository orderStatusHistoryRepository;

    @Mock
    private ReturnHistoryRepository returnHistoryRepository;

    @Mock
    private ProductService productService;

    @Mock
    private SepayConfig sepayConfig;

    @InjectMocks
    private OrderService orderService;

    @Test
    @DisplayName("testCreateOrder_COD: Đặt hàng COD thành công với giỏ hàng hợp lệ, cộng phí vận chuyển 30,000đ")
    void testCreateOrder_COD() {
        User user = new User("USR-1", "user@test.com", "pass", "Nguyễn Văn A", "0987654321", "ROLE_USER");
        Product product = new Product("P001", "Bánh Mì Đen", "Banh", "Mo ta", 50000, "url", "badge");
        CartItem item = new CartItem("USR-1", product, 2);

        CheckoutRequest request = new CheckoutRequest();
        request.setCustomerName("Nguyễn Văn A");
        request.setPhone("0987654321");
        request.setAddress("123 Phố Huế, Hà Nội");
        request.setNote("Giao giờ hành chính");
        request.setPaymentMethod("COD");

        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CheckoutResponse response = orderService.createOrder(user, List.of(item), 100000.0, request);

        assertNotNull(response);
        assertEquals("COD", response.getPaymentMethod());
        assertEquals("PENDING", response.getPaymentStatus());
        assertNull(response.getPayUrl());

        verify(productService).ensureAvailable("P001", 2);
        verify(orderRepository).save(argThat(o ->
                "USR-1".equals(o.getUserId()) &&
                o.getTotal() == 130000.0 && // 100,000 subtotal + 30,000 shipping
                "PENDING".equals(o.getOrderStatus()) &&
                o.getOrderCode().startsWith("HBK-")
        ));
        verify(orderStatusHistoryRepository).save(any());
    }

    @Test
    @DisplayName("testCreateOrder_VietQr: Đặt hàng thanh toán chuyển khoản sinh URL VietQR chính xác")
    void testCreateOrder_VietQr() {
        User user = new User("USR-1", "user@test.com", "pass", "Nguyễn Văn A", "0987654321", "ROLE_USER");
        Product product = new Product("P001", "Bánh Mì Đen", "Banh", "Mo ta", 50000, "url", "badge");
        CartItem item = new CartItem("USR-1", product, 1);

        CheckoutRequest request = new CheckoutRequest();
        request.setCustomerName("Nguyễn Văn A");
        request.setPhone("0987654321");
        request.setAddress("123 Phố Huế, Hà Nội");
        request.setPaymentMethod("VIETQR");

        when(sepayConfig.generateVietQrUrl(anyString(), anyDouble())).thenReturn("https://qr.sepay.vn/img?order=ORD-1");
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CheckoutResponse response = orderService.createOrder(user, List.of(item), 50000.0, request);

        assertNotNull(response);
        assertEquals("VIETQR", response.getPaymentMethod());
        assertEquals("https://qr.sepay.vn/img?order=ORD-1", response.getPayUrl());
        verify(sepayConfig).generateVietQrUrl(anyString(), eq(80000.0)); // 50,000 + 30,000
    }

    @Test
    @DisplayName("testUpdateStatus_ShippingToDelivered: Đơn hàng COD khi chuyển từ SHIPPING sang DELIVERED tự động đánh dấu PAID và trừ kho")
    void testUpdateStatus_ShippingToDelivered() {
        Order order = new Order();
        order.setId("ORD-1");
        order.setOrderStatus("SHIPPING");
        order.setPaymentMethod("COD");
        order.setPaymentStatus("PENDING");

        OrderItem item = new OrderItem("P001", "Bánh Mì Đen", "/images/banhmi.png", 65000.0, 2);
        item.setOrder(order);
        order.setItems(new ArrayList<>(List.of(item)));

        when(orderRepository.findWithItemsById("ORD-1")).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Order updated = orderService.updateStatus("ORD-1", "DELIVERED", null);

        assertEquals("DELIVERED", updated.getOrderStatus());
        assertEquals("PAID", updated.getPaymentStatus());
        verify(productService).decreaseStock(eq("P001"), eq(2), eq("ORDER"), eq("ORD-1"), anyString());
        verify(orderRepository).save(order);
    }

    @Test
    @DisplayName("testUpdateStatus_InvalidTransition: Ném ngoại lệ khi chuyển đơn PENDING trực tiếp sang DELIVERED")
    void testUpdateStatus_InvalidTransition() {
        Order order = new Order();
        order.setId("ORD-1");
        order.setOrderStatus("PENDING");

        when(orderRepository.findWithItemsById("ORD-1")).thenReturn(Optional.of(order));

        assertThrows(IllegalArgumentException.class, () ->
                orderService.updateStatus("ORD-1", "DELIVERED", null)
        );
        verify(orderRepository, never()).save(any());
    }

    @Test
    @DisplayName("testCancelOrder_Success: Người dùng hủy thành công khi đơn ở trạng thái PENDING")
    void testCancelOrder_Success() {
        Order order = new Order();
        order.setId("ORD-1");
        order.setUserId("USR-1");
        order.setOrderStatus("PENDING");

        when(orderRepository.findWithItemsById("ORD-1")).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Order cancelled = orderService.cancelOrder("ORD-1", "USR-1");

        assertEquals("CANCELLED", cancelled.getOrderStatus());
        verify(orderStatusHistoryRepository).save(any());
    }

    @Test
    @DisplayName("testCancelOrder_InvalidStatus: Ném ngoại lệ khi hủy đơn hàng đã hoặc đang giao")
    void testCancelOrder_InvalidStatus() {
        Order order = new Order();
        order.setId("ORD-1");
        order.setUserId("USR-1");
        order.setOrderStatus("SHIPPING");

        when(orderRepository.findWithItemsById("ORD-1")).thenReturn(Optional.of(order));

        assertThrows(IllegalArgumentException.class, () ->
                orderService.cancelOrder("ORD-1", "USR-1")
        );
        verify(orderRepository, never()).save(any());
    }

    @Test
    @DisplayName("testCancelOrder_WrongUser: Ném ngoại lệ khi người dùng không sở hữu đơn hàng yêu cầu hủy")
    void testCancelOrder_WrongUser() {
        Order order = new Order();
        order.setId("ORD-1");
        order.setUserId("USR-1");
        order.setOrderStatus("PENDING");

        when(orderRepository.findWithItemsById("ORD-1")).thenReturn(Optional.of(order));

        assertThrows(IllegalArgumentException.class, () ->
                orderService.cancelOrder("ORD-1", "HACKER-ID")
        );
    }

    @Test
    @DisplayName("testRequestReturn_ValidReason: Tạo yêu cầu đổi trả thành công khi đơn ở trạng thái RECEIVED")
    void testRequestReturn_ValidReason() {
        Order order = new Order();
        order.setId("ORD-1");
        order.setUserId("USR-1");
        order.setOrderStatus("RECEIVED");

        when(orderRepository.findWithItemsById("ORD-1")).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Order returned = orderService.requestReturn("ORD-1", "USR-1", "Bánh bị móp méo trong quá trình giao");

        assertEquals("RETURN_REQUESTED", returned.getOrderStatus());
        assertEquals("PENDING", returned.getReturnStatus());
        assertEquals("Bánh bị móp méo trong quá trình giao", returned.getReturnReason());
        verify(returnHistoryRepository).save(any());
    }

    @Test
    @DisplayName("testReviewReturn_Approve: Admin duyệt đổi trả hoàn kho sản phẩm")
    void testReviewReturn_Approve() {
        Order order = new Order();
        order.setId("ORD-1");
        order.setOrderStatus("RETURN_REQUESTED");
        order.setInventoryDeducted(true);

        OrderItem item = new OrderItem("P001", "Bánh Mì Đen", "/images/banhmi.png", 65000.0, 3);
        item.setOrder(order);
        order.setItems(new ArrayList<>(List.of(item)));

        when(orderRepository.findWithItemsById("ORD-1")).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Order reviewed = orderService.reviewReturn("ORD-1", "APPROVED", "Đồng ý nhận lại hàng");

        assertEquals("RETURNED", reviewed.getOrderStatus());
        assertEquals("APPROVED", reviewed.getReturnStatus());
        verify(productService).increaseStock(eq("P001"), eq(3), eq("RETURN"), eq("ORD-1"), anyString());
    }
}
