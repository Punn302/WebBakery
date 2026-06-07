package com.example.hebekery.service;

import com.example.hebekery.dto.CheckoutResponse;
import com.example.hebekery.dto.OrderResponse;
import com.example.hebekery.dto.request.CheckoutRequest;
import com.example.hebekery.model.CartItem;
import com.example.hebekery.model.Order;
import com.example.hebekery.model.OrderItem;
import com.example.hebekery.model.OrderStatusHistory;
import com.example.hebekery.model.User;
import com.example.hebekery.repository.OrderRepository;
import com.example.hebekery.repository.OrderStatusHistoryRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private static final String MOMO_PARTNER_CODE = "MOMO";
    private static final String MOMO_ACCESS_KEY = "F8BBA842ECF85";
    private static final String MOMO_SECRET_KEY = "K951B6PE1waDMi640xX08PD3vg6EkVlz";
    private static final String MOMO_ENDPOINT = "https://test-payment.momo.vn/v2/gateway/api/create";
    private static final String MOMO_RETURN_URL = "http://localhost:8080/checkout/success";
    private static final String MOMO_NOTIFY_URL = "http://localhost:8080/api/payment/momo/ipn";

    private final OrderRepository orderRepository;
    private final OrderStatusHistoryRepository orderStatusHistoryRepository;

    public OrderService(OrderRepository orderRepository, OrderStatusHistoryRepository orderStatusHistoryRepository) {
        this.orderRepository = orderRepository;
        this.orderStatusHistoryRepository = orderStatusHistoryRepository;
    }

    public CheckoutResponse createOrder(User user, List<CartItem> cartItems, double subtotal, CheckoutRequest request) {
        if (user == null) {
            throw new IllegalStateException("Vui lòng đăng nhập");
        }
        if (cartItems == null || cartItems.isEmpty()) {
            throw new IllegalArgumentException("Giỏ hàng đang trống");
        }

        Order order = new Order();
        order.setId("HBK-" + System.currentTimeMillis());
        order.setUserId(user.getId());
        order.setCustomerName(request.getCustomerName());
        order.setPhone(request.getPhone());
        order.setAddress(request.getAddress());
        order.setNote(request.getNote());
        order.setPaymentMethod(request.getPaymentMethod());
        order.setPaymentStatus("PENDING");
        order.setOrderStatus("PENDING");
        order.setTotal(subtotal + 30000);
        order.setCreatedAt(LocalDateTime.now());
        order.setItems(copyItems(order, cartItems));
        orderRepository.save(order);
        addHistory(order, "User tạo đơn hàng", "USER");

        if ("MOMO".equals(request.getPaymentMethod())) {
            return new CheckoutResponse(
                    order.getId(),
                    "MOMO",
                    "PENDING",
                    createMomoPaymentUrl(order),
                    "Đơn hàng đã tạo. Chuyển đến MoMo test để thanh toán."
            );
        }

        return new CheckoutResponse(
                order.getId(),
                "COD",
                "PENDING",
                null,
                "Đặt hàng COD thành công. Bạn sẽ thanh toán khi nhận hàng."
        );
    }

    public List<OrderResponse> getOrdersByUser(String userId) {
        return orderRepository.findByUserId(userId).stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public Page<OrderResponse> searchOrders(String keyword, Pageable pageable) {
        Page<Order> orders;
        if (keyword == null || keyword.trim().isEmpty()) {
            orders = orderRepository.findAll(pageable);
        } else {
            String term = keyword.trim();
            orders = orderRepository.findByIdContainingIgnoreCaseOrCustomerNameContainingIgnoreCaseOrPhoneContainingIgnoreCaseOrOrderStatusContainingIgnoreCase(
                    term,
                    term,
                    term,
                    term,
                    pageable
            );
        }
        return orders.map(this::toResponse);
    }

    public Order getOrderById(String orderId) {
        return orderRepository.findById(orderId).orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đơn hàng"));
    }

    public List<Order> trackOrders(String orderId, String phone) {
        return orderRepository.findAll().stream()
                .filter(order -> orderId == null || orderId.isBlank() || order.getId().equalsIgnoreCase(orderId.trim()))
                .filter(order -> phone == null || phone.isBlank() || order.getPhone().equals(phone.trim()))
                .collect(Collectors.toList());
    }

    public Order updateStatus(String orderId, String orderStatus, String paymentStatus) {
        Order order = getOrderById(orderId);
        if ("CANCELLED".equals(order.getOrderStatus())
                || "RECEIVED".equals(order.getOrderStatus())
                || "RETURN_REQUESTED".equals(order.getOrderStatus())
                || "RETURNED".equals(order.getOrderStatus())) {
            throw new IllegalArgumentException("Đơn hàng hiện không thể cập nhật giao hàng");
        }
        if (!"SHIPPING".equals(orderStatus) && !"DELIVERED".equals(orderStatus)) {
            throw new IllegalArgumentException("Admin chỉ được chuyển đơn sang Đang giao hoặc Đã giao");
        }
        if (orderStatus != null && !orderStatus.isBlank()) {
            order.setOrderStatus(orderStatus);
        }
        if ("DELIVERED".equals(orderStatus) && "COD".equals(order.getPaymentMethod())) {
            order.setPaymentStatus("PAID");
        } else if (paymentStatus != null && !paymentStatus.isBlank()) {
            if (!"PENDING".equals(paymentStatus) && !"PAID".equals(paymentStatus)) {
                throw new IllegalArgumentException("Trạng thái thanh toán không hợp lệ");
            }
            order.setPaymentStatus(paymentStatus);
        }
        Order saved = orderRepository.save(order);
        addHistory(saved, "Admin cập nhật trạng thái", "ADMIN");
        return saved;
    }

    public Order updateAdminNote(String orderId, String adminNote) {
        Order order = getOrderById(orderId);
        order.setAdminNote(adminNote);
        Order saved = orderRepository.save(order);
        addHistory(saved, "Admin ghi chú đơn hàng", "ADMIN");
        return saved;
    }

    public Order cancelOrder(String orderId, String userId) {
        Order order = getOrderById(orderId);
        if (!order.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Bạn không có quyền hủy đơn hàng này");
        }
        if (!"PENDING".equals(order.getOrderStatus()) && !"PROCESSING".equals(order.getOrderStatus())) {
            throw new IllegalArgumentException("Đơn hàng hiện tại không thể hủy");
        }
        order.setOrderStatus("CANCELLED");
        Order saved = orderRepository.save(order);
        addHistory(saved, "User hủy đơn hàng", "USER");
        return saved;
    }

    public Order markReceived(String orderId, String userId) {
        Order order = getOwnedOrder(orderId, userId);
        if (!"SHIPPING".equals(order.getOrderStatus()) && !"DELIVERED".equals(order.getOrderStatus())) {
            throw new IllegalArgumentException("Chỉ có thể xác nhận đã nhận khi đơn đang giao hoặc đã giao");
        }
        order.setOrderStatus("RECEIVED");
        if ("COD".equals(order.getPaymentMethod())) {
            order.setPaymentStatus("PAID");
        }
        Order saved = orderRepository.save(order);
        addHistory(saved, "User xác nhận đã nhận hàng", "USER");
        return saved;
    }

    public Order requestReturn(String orderId, String userId, String reason) {
        Order order = getOwnedOrder(orderId, userId);
        if (!"RECEIVED".equals(order.getOrderStatus())) {
            throw new IllegalArgumentException("Chỉ có thể yêu cầu đổi trả sau khi đã nhận hàng");
        }
        if (reason == null || reason.isBlank()) {
            throw new IllegalArgumentException("Vui lòng nhập lý do đổi trả");
        }
        order.setOrderStatus("RETURN_REQUESTED");
        order.setReturnStatus("PENDING");
        order.setReturnReason(reason.trim());
        Order saved = orderRepository.save(order);
        addHistory(saved, "User yêu cầu đổi trả: " + reason.trim(), "USER");
        return saved;
    }

    public Order reviewReturn(String orderId, String decision, String adminNote) {
        Order order = getOrderById(orderId);
        if (!"RETURN_REQUESTED".equals(order.getOrderStatus())) {
            throw new IllegalArgumentException("Đơn hàng chưa có yêu cầu đổi trả");
        }
        if ("APPROVED".equals(decision)) {
            order.setReturnStatus("APPROVED");
            order.setOrderStatus("RETURNED");
        } else if ("REJECTED".equals(decision)) {
            order.setReturnStatus("REJECTED");
            order.setOrderStatus("RECEIVED");
        } else {
            throw new IllegalArgumentException("Quyết định đổi trả không hợp lệ");
        }
        order.setAdminNote(adminNote);
        Order saved = orderRepository.save(order);
        addHistory(saved, "Admin " + ("APPROVED".equals(decision) ? "duyệt" : "từ chối") + " đổi trả: " + safe(adminNote), "ADMIN");
        return saved;
    }

    public List<OrderStatusHistory> getHistory(String orderId) {
        return orderStatusHistoryRepository.findByOrderIdOrderByCreatedAtAsc(orderId);
    }

    private Order getOwnedOrder(String orderId, String userId) {
        Order order = getOrderById(orderId);
        if (!order.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Bạn không có quyền thao tác đơn hàng này");
        }
        return order;
    }

    private List<OrderItem> copyItems(Order order, List<CartItem> cartItems) {
        return cartItems.stream()
                .map(item -> {
                    OrderItem orderItem = new OrderItem(
                            item.getProductId(),
                            item.getProductName(),
                            item.getImageUrl(),
                            item.getPrice(),
                            item.getQuantity()
                    );
                    orderItem.setOrder(order);
                    return orderItem;
                })
                .collect(Collectors.toList());
    }

    private OrderResponse toResponse(Order order) {
        OrderItem firstItem = order.getItems().isEmpty() ? null : order.getItems().get(0);
        return new OrderResponse(
                order.getId(),
                order.getCreatedAt().toString(),
                statusClass(order),
                statusText(order),
                order.getOrderStatus(),
                order.getPaymentStatus(),
                firstItem == null ? "" : firstItem.getImageUrl(),
                firstItem == null ? "" : firstItem.getProductName(),
                order.getItems().stream().mapToInt(OrderItem::getQuantity).sum(),
                order.getTotal()
        );
    }

    private String statusClass(Order order) {
        if ("RECEIVED".equals(order.getOrderStatus()) || "DELIVERED".equals(order.getOrderStatus())) {
            return "status-success";
        }
        if ("PENDING".equals(order.getOrderStatus()) || "PROCESSING".equals(order.getOrderStatus()) || "SHIPPING".equals(order.getOrderStatus())) {
            return "status-pending";
        }
        if ("CANCELLED".equals(order.getOrderStatus()) || "RETURN_REQUESTED".equals(order.getOrderStatus())) {
            return "status-cancelled";
        }
        return "status-new";
    }

    public String statusText(Order order) {
        String orderText = switch (order.getOrderStatus()) {
            case "PENDING" -> "Chờ xử lý";
            case "PROCESSING" -> "Đang xử lý";
            case "SHIPPING" -> "Đang giao";
            case "DELIVERED" -> "Đã giao";
            case "RECEIVED" -> "Đã nhận";
            case "CANCELLED" -> "Đã hủy";
            case "RETURN_REQUESTED" -> "Yêu cầu đổi trả";
            case "RETURNED" -> "Đã đổi trả";
            default -> order.getOrderStatus();
        };
        String paymentText = switch (order.getPaymentStatus()) {
            case "PAID" -> "Đã thanh toán";
            case "PENDING" -> "Chờ thanh toán";
            default -> order.getPaymentStatus();
        };
        return orderText + " / " + paymentText;
    }

    public String returnStatusText(Order order) {
        if (order.getReturnStatus() == null || order.getReturnStatus().isBlank()) {
            return "Chưa có yêu cầu";
        }
        return switch (order.getReturnStatus()) {
            case "PENDING" -> "Chờ duyệt";
            case "APPROVED" -> "Đã duyệt";
            case "REJECTED" -> "Đã từ chối";
            default -> order.getReturnStatus();
        };
    }

    private void addHistory(Order order, String note, String changedBy) {
        orderStatusHistoryRepository.save(new OrderStatusHistory(
                order.getId(),
                order.getOrderStatus(),
                order.getPaymentStatus(),
                note,
                changedBy
        ));
    }

    private String safe(String value) {
        return value == null ? "" : value.trim();
    }

    private String createMomoPaymentUrl(Order order) {
        String requestId = UUID.randomUUID().toString();
        String orderInfo = "Thanh toán đơn hàng " + order.getId();
        String amount = String.valueOf((long) order.getTotal());
        String extraData = "";
        String requestType = "captureWallet";

        String rawSignature = "accessKey=" + MOMO_ACCESS_KEY
                + "&amount=" + amount
                + "&extraData=" + extraData
                + "&ipnUrl=" + MOMO_NOTIFY_URL
                + "&orderId=" + order.getId()
                + "&orderInfo=" + orderInfo
                + "&partnerCode=" + MOMO_PARTNER_CODE
                + "&redirectUrl=" + MOMO_RETURN_URL
                + "&requestId=" + requestId
                + "&requestType=" + requestType;

        String signature = hmacSha256(rawSignature, MOMO_SECRET_KEY);

        String payload = "{"
                + "\"partnerCode\":\"" + MOMO_PARTNER_CODE + "\","
                + "\"accessKey\":\"" + MOMO_ACCESS_KEY + "\","
                + "\"requestId\":\"" + requestId + "\","
                + "\"amount\":\"" + amount + "\","
                + "\"orderId\":\"" + order.getId() + "\","
                + "\"orderInfo\":\"" + orderInfo + "\","
                + "\"redirectUrl\":\"" + MOMO_RETURN_URL + "\","
                + "\"ipnUrl\":\"" + MOMO_NOTIFY_URL + "\","
                + "\"extraData\":\"" + extraData + "\","
                + "\"requestType\":\"" + requestType + "\","
                + "\"signature\":\"" + signature + "\""
                + "}";

        try {
            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create(MOMO_ENDPOINT))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(payload))
                    .build();
            HttpResponse<String> response = HttpClient.newHttpClient().send(httpRequest, HttpResponse.BodyHandlers.ofString());
            String payUrl = extractJsonString(response.body(), "payUrl");
            if (payUrl != null && !payUrl.isBlank()) {
                return payUrl;
            }
        } catch (Exception ignored) {
            // Runtime may be offline during local development. Fallback keeps the checkout flow testable.
        }

        return "/checkout/momo-test?orderId=" + encode(order.getId());
    }

    private String extractJsonString(String json, String key) {
        if (json == null) {
            return null;
        }
        String marker = "\"" + key + "\":\"";
        int start = json.indexOf(marker);
        if (start < 0) {
            return null;
        }
        start += marker.length();
        int end = json.indexOf("\"", start);
        if (end < 0) {
            return null;
        }
        return json.substring(start, end).replace("\\/", "/");
    }

    private String hmacSha256(String data, String secretKey) {
        try {
            Mac hmacSha256 = Mac.getInstance("HmacSHA256");
            SecretKeySpec keySpec = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            hmacSha256.init(keySpec);
            byte[] hash = hmacSha256.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder result = new StringBuilder();
            for (byte b : hash) {
                result.append(String.format("%02x", b));
            }
            return result.toString();
        } catch (Exception ex) {
            throw new IllegalStateException("Không thể tạo chữ ký MoMo");
        }
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}
