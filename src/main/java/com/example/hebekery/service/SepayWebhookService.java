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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class SepayWebhookService {

    private static final Logger log = LoggerFactory.getLogger(SepayWebhookService.class);
    private static final Pattern HBK_PATTERN = Pattern.compile("(?i)(HBK[-_A-Za-z0-9]+)");

    private final SepayConfig sepayConfig;
    private final OrderRepository orderRepository;
    private final OrderStatusHistoryRepository orderStatusHistoryRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final CustomerProfileRepository customerProfileRepository;

    public SepayWebhookService(SepayConfig sepayConfig,
                               OrderRepository orderRepository,
                               OrderStatusHistoryRepository orderStatusHistoryRepository,
                               PaymentTransactionRepository paymentTransactionRepository,
                               CustomerProfileRepository customerProfileRepository) {
        this.sepayConfig = sepayConfig;
        this.orderRepository = orderRepository;
        this.orderStatusHistoryRepository = orderStatusHistoryRepository;
        this.paymentTransactionRepository = paymentTransactionRepository;
        this.customerProfileRepository = customerProfileRepository;
    }

    /**
     * Xác thực Header Authorization của SePay Webhook
     */
    public boolean verifyApiKey(String authHeader) {
        String expectedKey = sepayConfig.getWebhookApiKey();
        if (expectedKey == null || expectedKey.isBlank()) {
            log.warn("SePay Webhook: Cấu hình webhook API key trống. Từ chối xác thực (Fail-closed).");
            return false;
        }
        if (authHeader == null || authHeader.isBlank()) {
            return false;
        }
        String cleanHeader = authHeader.trim();
        if (cleanHeader.toLowerCase().startsWith("apikey ")) {
            cleanHeader = cleanHeader.substring(7).trim();
        } else if (cleanHeader.toLowerCase().startsWith("bearer ")) {
            cleanHeader = cleanHeader.substring(7).trim();
        }
        byte[] expectedBytes = expectedKey.getBytes(StandardCharsets.UTF_8);
        byte[] actualBytes = cleanHeader.getBytes(StandardCharsets.UTF_8);
        return MessageDigest.isEqual(expectedBytes, actualBytes);
    }

    /**
     * Xử lý webhook thanh toán từ SePay
     */
    @Transactional
    public boolean processWebhook(SepayWebhookPayload payload) {
        if (payload == null) {
            log.warn("SePay Webhook: Payload rỗng");
            return false;
        }

        // 1. Kiểm tra Idempotency chống xử lý trùng lặp giao dịch
        String referenceCode = payload.getReferenceCode();
        if (referenceCode != null && !referenceCode.isBlank()) {
            if (paymentTransactionRepository.existsByReferenceCode(referenceCode.trim())) {
                log.info("SePay Webhook: Giao dịch {} đã được xử lý trước đó (Idempotent)", referenceCode);
                return true;
            }
        }

        // 2. Kiểm tra loại giao dịch: chỉ chấp nhận tiền vào ("in")
        if (payload.getTransferType() != null && !"in".equalsIgnoreCase(payload.getTransferType().trim())) {
            log.info("SePay Webhook: Bỏ qua giao dịch không phải tiền vào: {}", payload.getTransferType());
            return false;
        }

        // 3. Trích xuất mã đơn hàng từ nội dung chuyển khoản
        String content = payload.getContent();
        if (content == null || content.isBlank()) {
            log.warn("SePay Webhook: Nội dung giao dịch trống");
            return false;
        }

        Order order = findOrderByContent(content)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đơn hàng tương ứng với nội dung: " + content));

        Double amount = payload.getTransferAmount();

        // 4. Nếu đơn hàng đã bị HỦY trước đó: không chuyển sang PAID âm thầm, cắm cờ cho nhân viên xử lý
        if ("CANCELLED".equalsIgnoreCase(order.getOrderStatus())) {
            log.warn("SePay Webhook: Đơn hàng {} đã bị HỦY nhưng nhận được thanh toán: {}", order.getId(), amount);
            order.setAdminNote((order.getAdminNote() != null ? order.getAdminNote() + " | " : "")
                    + "CẢNH BÁO: Nhận thanh toán " + (amount != null ? Math.round(amount) : 0) + " VNĐ cho đơn hàng ĐÃ HỦY. Cần nhân viên kiểm tra hoàn tiền.");
            orderRepository.save(order);

            orderStatusHistoryRepository.save(new OrderStatusHistory(
                    order.getId(),
                    order.getOrderStatus(),
                    "CANCELLED_PAYMENT_RECEIVED",
                    "Đã nhận chuyển khoản " + (amount != null ? Math.round(amount) : 0) + " VNĐ cho đơn đã hủy. Cần nhân viên đối soát.",
                    "SEPAY_WEBHOOK"
            ));

            PaymentTransaction tx = new PaymentTransaction(
                    "TX-" + UUID.randomUUID(),
                    order.getId(),
                    referenceCode != null && !referenceCode.isBlank() ? referenceCode.trim() : "TX-" + UUID.randomUUID(),
                    payload.getGateway(),
                    payload.getAccountNumber(),
                    amount != null ? amount : 0.0,
                    payload.getTransferType(),
                    payload.getContent(),
                    parseTransactionDate(payload.getTransactionDate())
            );
            paymentTransactionRepository.save(tx);
            return true;
        }

        // 5. Kiểm tra số tiền chuyển khoản: xử lý thiếu tiền một cách an toàn không crash
        if (amount == null || amount < (order.getTotal() - 1.0)) {
            log.warn("SePay Webhook: Số tiền thanh toán không đủ. Nhận: {}, Yêu cầu: {}", amount, order.getTotal());
            order.setAdminNote((order.getAdminNote() != null ? order.getAdminNote() + " | " : "")
                    + "CẢNH BÁO: Thanh toán thiếu. Nhận " + (amount != null ? Math.round(amount) : 0) + " / " + Math.round(order.getTotal()) + " VNĐ. Mã GD: " + referenceCode);
            orderRepository.save(order);

            orderStatusHistoryRepository.save(new OrderStatusHistory(
                    order.getId(),
                    order.getOrderStatus(),
                    "PARTIAL_PAYMENT",
                    "Thanh toán thiếu: nhận " + (amount != null ? Math.round(amount) : 0) + " VNĐ / " + Math.round(order.getTotal()) + " VNĐ. Cần kiểm tra.",
                    "SEPAY_WEBHOOK"
            ));

            if (referenceCode != null && !referenceCode.isBlank()) {
                PaymentTransaction tx = new PaymentTransaction(
                        "TX-" + UUID.randomUUID(),
                        order.getId(),
                        referenceCode.trim(),
                        payload.getGateway(),
                        payload.getAccountNumber(),
                        amount != null ? amount : 0.0,
                        payload.getTransferType(),
                        payload.getContent(),
                        parseTransactionDate(payload.getTransactionDate())
                );
                paymentTransactionRepository.save(tx);
            }
            return false;
        }

        // 6. Cập nhật trạng thái đơn hàng sang PAID và PROCESSING
        order.setPaymentStatus("PAID");
        if ("PENDING".equals(order.getOrderStatus()) || "AWAITING_PAYMENT".equals(order.getOrderStatus())) {
            order.setOrderStatus("PROCESSING");
        }
        orderRepository.save(order);

        // 7. Ghi log lịch sử trạng thái đơn
        orderStatusHistoryRepository.save(new OrderStatusHistory(
                order.getId(),
                order.getOrderStatus(),
                "PAID",
                "SePay Webhook xác nhận đã nhận chuyển khoản: " + Math.round(amount) + " VNĐ (Mã GD: " + referenceCode + ")",
                "SEPAY_WEBHOOK"
        ));

        // 8. Lưu bản ghi PaymentTransaction
        PaymentTransaction tx = new PaymentTransaction(
                "TX-" + UUID.randomUUID(),
                order.getId(),
                referenceCode != null && !referenceCode.isBlank() ? referenceCode.trim() : "TX-" + UUID.randomUUID(),
                payload.getGateway(),
                payload.getAccountNumber(),
                amount,
                payload.getTransferType(),
                payload.getContent(),
                parseTransactionDate(payload.getTransactionDate())
        );
        paymentTransactionRepository.save(tx);

        // Chú ý: Loyalty points được tích khi đơn hoàn tất/giao hàng (OrderService.markReceived),
        // không cộng tại webhook thanh toán để tránh cộng điểm 2 lần.

        log.info("SePay Webhook: Xử lý thành công đơn hàng {} - Số tiền: {}", order.getId(), amount);
        return true;
    }

    /**
     * Tìm kiếm đơn hàng qua nội dung chuyển khoản (Regex & Direct Query, không scan full table)
     */
    public Optional<Order> findOrderByContent(String content) {
        if (content == null || content.isBlank()) {
            return Optional.empty();
        }

        // Tìm chuỗi dạng HBK...
        Matcher matcher = HBK_PATTERN.matcher(content);
        if (matcher.find()) {
            String token = matcher.group(1).trim();
            // Thử tìm theo orderCode trước
            Optional<Order> byCode = orderRepository.findByOrderCode(token);
            if (byCode.isPresent()) return byCode;

            // Thử tìm theo ID
            Optional<Order> byId = orderRepository.findById(token);
            if (byId.isPresent()) return byId;

            // Thử bỏ tiền tố "HBK" hoặc "HBK-"
            String rawCode = token.replaceFirst("(?i)^HBK[-_]?", "");
            Optional<Order> byRawCode = orderRepository.findByOrderCode(rawCode);
            if (byRawCode.isPresent()) return byRawCode;

            Optional<Order> byRawId = orderRepository.findById(rawCode);
            if (byRawId.isPresent()) return byRawId;

            // Thử thêm "ORD-" nếu token chứa UUID
            Optional<Order> byOrdId = orderRepository.findById("ORD-" + rawCode);
            if (byOrdId.isPresent()) return byOrdId;
        }

        // Trích xuất các chuỗi alphanumeric khác có khả năng là mã đơn hàng để truy vấn trực tiếp
        Pattern tokenPattern = Pattern.compile("[A-Za-z0-9_-]{4,}");
        Matcher tokenMatcher = tokenPattern.matcher(content);
        while (tokenMatcher.find()) {
            String candidate = tokenMatcher.group().trim();
            Optional<Order> directMatch = orderRepository.findByOrderCode(candidate)
                    .or(() -> orderRepository.findById(candidate));
            if (directMatch.isPresent()) {
                return directMatch;
            }
        }

        return Optional.empty();
    }

    private LocalDateTime parseTransactionDate(String dateStr) {
        if (dateStr == null || dateStr.isBlank()) {
            return LocalDateTime.now();
        }
        try {
            return LocalDateTime.parse(dateStr.trim(), DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        } catch (Exception e) {
            try {
                return LocalDateTime.parse(dateStr.trim(), DateTimeFormatter.ISO_LOCAL_DATE_TIME);
            } catch (Exception ex) {
                return LocalDateTime.now();
            }
        }
    }
}
