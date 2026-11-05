package com.example.hebekery.service;

import com.example.hebekery.config.SepayConfig;
import com.example.hebekery.dto.request.SepayWebhookPayload;
import com.example.hebekery.model.CustomerProfile;
import com.example.hebekery.model.Order;
import com.example.hebekery.model.OrderStatusHistory;
import com.example.hebekery.model.PaymentTransaction;
import com.example.hebekery.repository.CustomerProfileRepository;
import com.example.hebekery.repository.OrderRepository;
import com.example.hebekery.repository.OrderStatusHistoryRepository;
import com.example.hebekery.repository.PaymentTransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SepayWebhookServiceTest {

    @Mock
    private SepayConfig sepayConfig;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private OrderStatusHistoryRepository orderStatusHistoryRepository;

    @Mock
    private PaymentTransactionRepository paymentTransactionRepository;

    @Mock
    private CustomerProfileRepository customerProfileRepository;

    @InjectMocks
    private SepayWebhookService sepayWebhookService;

    @BeforeEach
    void setUp() {
    }

    @Test
    @DisplayName("verifyApiKey: Trả về true khi API key khớp chuẩn với cấu hình")
    void verifyApiKey_success() {
        when(sepayConfig.getWebhookApiKey()).thenReturn("secret_test_key_123");

        assertTrue(sepayWebhookService.verifyApiKey("Apikey secret_test_key_123"));
        assertTrue(sepayWebhookService.verifyApiKey("Bearer secret_test_key_123"));
        assertTrue(sepayWebhookService.verifyApiKey("secret_test_key_123"));
    }

    @Test
    @DisplayName("verifyApiKey: Trả về false khi sai hoặc thiếu API key")
    void verifyApiKey_failure() {
        when(sepayConfig.getWebhookApiKey()).thenReturn("secret_test_key_123");

        assertFalse(sepayWebhookService.verifyApiKey("Apikey wrong_key"));
        assertFalse(sepayWebhookService.verifyApiKey(""));
        assertFalse(sepayWebhookService.verifyApiKey(null));
    }

    @Test
    @DisplayName("processWebhook: Thanh toán thành công, chuyển đơn sang PAID và PROCESSING")
    void processWebhook_success() {
        SepayWebhookPayload payload = new SepayWebhookPayload();
        payload.setReferenceCode("FT999888");
        payload.setTransferType("in");
        payload.setTransferAmount(250000.0);
        payload.setContent("HBK-20261105-001 thanh toan tien banh");
        payload.setGateway("MBBank");
        payload.setAccountNumber("0987654321");
        payload.setTransactionDate("2026-11-05 10:30:00");

        Order order = new Order();
        order.setId("ORD-12345");
        order.setOrderCode("HBK-20261105-001");
        order.setTotal(250000.0);
        order.setPaymentStatus("PENDING");
        order.setOrderStatus("PENDING");
        order.setUserId("USER-1");

        when(paymentTransactionRepository.existsByReferenceCode("FT999888")).thenReturn(false);
        when(orderRepository.findByOrderCode("HBK-20261105-001")).thenReturn(Optional.of(order));
        when(customerProfileRepository.findByUserId("USER-1")).thenReturn(Optional.empty());

        boolean result = sepayWebhookService.processWebhook(payload);

        assertTrue(result);
        assertEquals("PAID", order.getPaymentStatus());
        assertEquals("PROCESSING", order.getOrderStatus());
        verify(orderRepository).save(order);
        verify(orderStatusHistoryRepository).save(any(OrderStatusHistory.class));
        verify(paymentTransactionRepository).save(any(PaymentTransaction.class));
        verify(customerProfileRepository).save(any(CustomerProfile.class));
    }

    @Test
    @DisplayName("processWebhook: Idempotency - Không xử lý trùng khi referenceCode đã tồn tại")
    void processWebhook_idempotency_duplicateReference() {
        SepayWebhookPayload payload = new SepayWebhookPayload();
        payload.setReferenceCode("FT_ALREADY_PROCESSED");
        payload.setTransferType("in");

        when(paymentTransactionRepository.existsByReferenceCode("FT_ALREADY_PROCESSED")).thenReturn(true);

        boolean result = sepayWebhookService.processWebhook(payload);

        assertTrue(result);
        verify(orderRepository, never()).save(any());
        verify(paymentTransactionRepository, never()).save(any());
    }

    @Test
    @DisplayName("processWebhook: Bỏ qua khi transferType không phải 'in'")
    void processWebhook_ignoreNonInTransfer() {
        SepayWebhookPayload payload = new SepayWebhookPayload();
        payload.setReferenceCode("FT_OUT_123");
        payload.setTransferType("out");

        when(paymentTransactionRepository.existsByReferenceCode("FT_OUT_123")).thenReturn(false);

        boolean result = sepayWebhookService.processWebhook(payload);

        assertFalse(result);
        verify(orderRepository, never()).save(any());
    }

    @Test
    @DisplayName("processWebhook: Ném lỗi khi số tiền chuyển khoản không đủ")
    void processWebhook_insufficientAmount() {
        SepayWebhookPayload payload = new SepayWebhookPayload();
        payload.setReferenceCode("FT_SHORT");
        payload.setTransferType("in");
        payload.setTransferAmount(50000.0); // Thiếu tiền
        payload.setContent("HBK-20261105-001");

        Order order = new Order();
        order.setId("ORD-12345");
        order.setOrderCode("HBK-20261105-001");
        order.setTotal(250000.0);

        when(paymentTransactionRepository.existsByReferenceCode("FT_SHORT")).thenReturn(false);
        when(orderRepository.findByOrderCode("HBK-20261105-001")).thenReturn(Optional.of(order));

        assertThrows(IllegalArgumentException.class, () -> sepayWebhookService.processWebhook(payload));
        verify(orderRepository, never()).save(any());
    }

    @Test
    @DisplayName("processWebhook: Ném lỗi khi không tìm thấy đơn hàng tương ứng")
    void processWebhook_orderNotFound() {
        SepayWebhookPayload payload = new SepayWebhookPayload();
        payload.setReferenceCode("FT_NOT_FOUND");
        payload.setTransferType("in");
        payload.setContent("HBK-NONEXISTENT");

        when(paymentTransactionRepository.existsByReferenceCode("FT_NOT_FOUND")).thenReturn(false);
        when(orderRepository.findByOrderCode("HBK-NONEXISTENT")).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> sepayWebhookService.processWebhook(payload));
    }
}
