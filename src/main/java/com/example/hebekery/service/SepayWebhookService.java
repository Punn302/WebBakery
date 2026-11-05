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
            return true;
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
        return expectedKey.equals(cleanHeader);
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

        // 4. Kiểm tra số tiền chuyển khoản
        Double amount = payload.getTransferAmount();
        if (amount == null || amount < (order.getTotal() - 1.0)) {
            log.error("SePay Webhook: Số tiền thanh toán không đủ. Nhận: {}, Yêu cầu: {}", amount, order.getTotal());
            throw new IllegalArgumentException("Số tiền thanh toán không khớp với giá trị đơn hàng");
        }

        // 5. Cập nhật trạng thái đơn hàng sang PAID và PROCESSING
        order.setPaymentStatus("PAID");
        if ("PENDING".equals(order.getOrderStatus()) || "AWAITING_PAYMENT".equals(order.getOrderStatus())) {
            order.setOrderStatus("PROCESSING");
        }
        orderRepository.save(order);

        // 6. Ghi log lịch sử trạng thái đơn
        orderStatusHistoryRepository.save(new OrderStatusHistory(
                order.getId(),
                order.getOrderStatus(),
                "PAID",
                "SePay Webhook xác nhận đã nhận chuyển khoản: " + Math.round(amount) + " VNĐ (Mã GD: " + referenceCode + ")",
                "SEPAY_WEBHOOK"
        ));

        // 7. Lưu bản ghi PaymentTransaction
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

        // 8. Tích điểm thành viên nếu đơn hàng thuộc về một User đã đăng ký
        if (order.getUserId() != null && !order.getUserId().isBlank()) {
            awardLoyaltyPoints(order.getUserId(), order.getTotal());
        }

        log.info("SePay Webhook: Xử lý thành công đơn hàng {} - Số tiền: {}", order.getId(), amount);
        return true;
    }

    /**
     * Tìm kiếm đơn hàng qua nội dung chuyển khoản (Regex & String Search)
     */
    public Optional<Order> findOrderByContent(String content) {
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

        // Nếu regex không ra, duyệt qua các đơn chưa thanh toán gần đây
        return orderRepository.findAll().stream()
                .filter(o -> "PENDING".equals(o.getPaymentStatus()))
                .filter(o -> {
                    boolean codeMatch = o.getOrderCode() != null && content.contains(o.getOrderCode().replaceAll("[^A-Za-z0-9]", ""));
                    boolean idMatch = o.getId() != null && content.contains(o.getId().replaceAll("[^A-Za-z0-9]", ""));
                    return codeMatch || idMatch;
                })
                .findFirst();
    }

    private void awardLoyaltyPoints(String userId, double totalSpent) {
        try {
            CustomerProfile profile = customerProfileRepository.findByUserId(userId)
                    .orElseGet(() -> new CustomerProfile("PROF-" + UUID.randomUUID(), userId));
            profile.addSpending(totalSpent);
            customerProfileRepository.save(profile);
            log.info("Cộng điểm thưởng cho User {}: Tổng chi tiêu mới = {}, Điểm = {}", userId, profile.getTotalSpent(), profile.getLoyaltyPoints());
        } catch (Exception e) {
            log.error("Lỗi khi cộng điểm thưởng thành viên: {}", e.getMessage());
        }
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
