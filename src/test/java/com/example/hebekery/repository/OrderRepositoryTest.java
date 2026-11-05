package com.example.hebekery.repository;

import com.example.hebekery.model.Order;
import com.example.hebekery.model.OrderItem;
import com.example.hebekery.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class OrderRepositoryTest {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    private String testUserId;

    @BeforeEach
    void setUp() {
        User user = userRepository.findById("1").orElseGet(() -> {
            User u = new User();
            u.setId("1");
            u.setEmail("user@hebekery.vn");
            u.setPassword("password");
            u.setName("Test User");
            u.setRole("USER");
            return userRepository.save(u);
        });
        testUserId = user.getId();
    }

    @Test
    @DisplayName("search: Tìm kiếm đơn hàng theo từ khóa người nhận hoặc mã đơn hàng")
    void testSearch_Keyword() {
        Order order = new Order();
        String id = "ORD-" + UUID.randomUUID();
        order.setId(id);
        order.setOrderCode("HBK-TEST-KW");
        order.setUserId(testUserId);
        order.setCustomerName("Nguyễn Hoàng Nam");
        order.setPhone("0987111222");
        order.setAddress("456 Lê Duẩn");
        order.setOrderStatus("PENDING");
        order.setPaymentMethod("COD");
        order.setPaymentStatus("PENDING");
        order.setTotal(150000.0);
        order.setCreatedAt(LocalDateTime.now());

        orderRepository.save(order);

        Page<Order> result = orderRepository.search("Hoàng Nam", "", "", null, null, PageRequest.of(0, 10));
        assertFalse(result.isEmpty());
        assertTrue(result.getContent().stream().anyMatch(o -> o.getId().equals(id)));
    }

    @Test
    @DisplayName("search: Lọc đơn hàng theo trạng thái đơn hàng và phương thức thanh toán")
    void testSearch_StatusAndPayment() {
        Order order1 = new Order();
        String id1 = "ORD-" + UUID.randomUUID();
        order1.setId(id1);
        order1.setOrderCode("HBK-TEST-ST1");
        order1.setUserId(testUserId);
        order1.setCustomerName("Khách Hàng 1");
        order1.setPhone("0987333444");
        order1.setAddress("Hà Nội");
        order1.setOrderStatus("DELIVERED");
        order1.setPaymentMethod("COD");
        order1.setPaymentStatus("PAID");
        order1.setTotal(200000.0);
        order1.setCreatedAt(LocalDateTime.now());

        orderRepository.save(order1);

        Page<Order> result = orderRepository.search(null, "DELIVERED", "COD", null, null, PageRequest.of(0, 10));
        assertFalse(result.isEmpty());
        assertTrue(result.getContent().stream().anyMatch(o -> o.getId().equals(id1)));
    }

    @Test
    @DisplayName("findWithItemsById: Nạp đơn hàng kèm chi tiết mặt hàng (items) thông qua EntityGraph")
    void testFindWithItemsById() {
        Order order = new Order();
        String id = "ORD-" + UUID.randomUUID();
        order.setId(id);
        order.setOrderCode("HBK-TEST-ITEMS");
        order.setUserId(testUserId);
        order.setCustomerName("Khách Hàng Test Items");
        order.setPhone("0987555666");
        order.setAddress("Đà Nẵng");
        order.setOrderStatus("PENDING");
        order.setPaymentMethod("COD");
        order.setPaymentStatus("PENDING");
        order.setTotal(100000.0);
        order.setCreatedAt(LocalDateTime.now());

        OrderItem item = new OrderItem("P001", "Bánh Mì Hạt", "/images/hat.png", 50000.0, 2);
        item.setOrder(order);
        order.setItems(new ArrayList<>(List.of(item)));

        orderRepository.save(order);

        Optional<Order> found = orderRepository.findWithItemsById(id);
        assertTrue(found.isPresent());
        assertNotNull(found.get().getItems());
        assertEquals(1, found.get().getItems().size());
        assertEquals("Bánh Mì Hạt", found.get().getItems().get(0).getProductName());
    }

    @Test
    @DisplayName("findByOrderCode: Tra cứu đơn hàng chính xác qua mã khách hàng nhìn thấy")
    void testFindByOrderCode() {
        Order order = new Order();
        String id = "ORD-" + UUID.randomUUID();
        String code = "HBK-20261105-CODE99";
        order.setId(id);
        order.setOrderCode(code);
        order.setUserId(testUserId);
        order.setCustomerName("Khách Hàng Code");
        order.setPhone("0987777888");
        order.setAddress("Cần Thơ");
        order.setOrderStatus("SHIPPING");
        order.setPaymentMethod("VIETQR");
        order.setPaymentStatus("PAID");
        order.setTotal(80000.0);
        order.setCreatedAt(LocalDateTime.now());

        orderRepository.save(order);

        Optional<Order> found = orderRepository.findByOrderCode(code);
        assertTrue(found.isPresent());
        assertEquals(id, found.get().getId());
    }
}
