package com.example.hebekery.service;

import com.example.hebekery.config.SepayConfig;
import com.example.hebekery.dto.CheckoutResponse;
import com.example.hebekery.dto.OrderResponse;
import com.example.hebekery.dto.request.CheckoutRequest;
import com.example.hebekery.model.CartItem;
import com.example.hebekery.model.Order;
import com.example.hebekery.model.OrderItem;
import com.example.hebekery.model.OrderStatusHistory;
import com.example.hebekery.model.ReturnHistory;
import com.example.hebekery.model.User;
import com.example.hebekery.model.Product;
import com.example.hebekery.repository.OrderRepository;
import com.example.hebekery.repository.OrderStatusHistoryRepository;
import com.example.hebekery.repository.ReturnHistoryRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderStatusHistoryRepository orderStatusHistoryRepository;
    private final ReturnHistoryRepository returnHistoryRepository;
    private final ProductService productService;
    private final SepayConfig sepayConfig;

    public OrderService(OrderRepository orderRepository,
                        OrderStatusHistoryRepository orderStatusHistoryRepository,
                        ReturnHistoryRepository returnHistoryRepository,
                        ProductService productService,
                        SepayConfig sepayConfig) {
        this.orderRepository = orderRepository;
        this.orderStatusHistoryRepository = orderStatusHistoryRepository;
        this.returnHistoryRepository = returnHistoryRepository;
        this.productService = productService;
        this.sepayConfig = sepayConfig;
    }

    @Transactional
    public CheckoutResponse createOrder(User user, List<CartItem> cartItems, double subtotal, CheckoutRequest request) {
        validateCheckout(user, cartItems);

        Order order = new Order();
        String technicalId = "ORD-" + java.util.UUID.randomUUID();
        String businessCode = "HBK-" + LocalDate.now().toString().replace("-", "") + "-" + java.util.UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        order.setId(technicalId);
        order.setOrderCode(businessCode);
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

        if ("VIETQR".equalsIgnoreCase(request.getPaymentMethod()) || "MOMO".equalsIgnoreCase(request.getPaymentMethod())) {
            String paymentUrl = sepayConfig.generateVietQrUrl(order.getId(), order.getTotal());
            return new CheckoutResponse(
                    order.getId(),
                    "VIETQR",
                    "PENDING",
                    paymentUrl,
                    "Đơn hàng đã tạo. Vui lòng quét mã VietQR để hoàn tất thanh toán."
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

    public void validateCheckout(User user, List<CartItem> cartItems) {
        if (user == null) {
            throw new IllegalStateException("Vui lòng đăng nhập");
        }
        if (cartItems == null || cartItems.isEmpty()) {
            throw new IllegalArgumentException("Giỏ hàng đang trống");
        }
        cartItems.forEach(item -> productService.ensureAvailable(item.getProductId(), item.getQuantity()));
    }

    @Transactional
    public CheckoutResponse createPaidOrder(User user, List<CartItem> cartItems, double subtotal, CheckoutRequest request) {
        validateCheckout(user, cartItems);

        Order order = new Order();
        String technicalId = "ORD-" + java.util.UUID.randomUUID();
        String businessCode = "HBK-" + LocalDate.now().toString().replace("-", "") + "-" + java.util.UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        order.setId(technicalId);
        order.setOrderCode(businessCode);
        order.setUserId(user.getId());
        order.setCustomerName(request.getCustomerName());
        order.setPhone(request.getPhone());
        order.setAddress(request.getAddress());
        order.setNote(request.getNote());
        order.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "VIETQR");
        order.setPaymentStatus("PAID");
        order.setOrderStatus("PENDING");
        order.setTotal(subtotal + 30000);
        order.setCreatedAt(LocalDateTime.now());
        order.setItems(copyItems(order, cartItems));
        orderRepository.save(order);
        addHistory(order, "Đơn hàng đã được thanh toán", "SYSTEM");

        return new CheckoutResponse(
                order.getId(),
                order.getPaymentMethod(),
                "PAID",
                null,
                "Thanh toán thành công. Đơn hàng đã được ghi nhận."
        );
    }

    @Transactional
    public CheckoutResponse createPaidMomoOrder(User user, List<CartItem> cartItems, double subtotal, CheckoutRequest request) {
        return createPaidOrder(user, cartItems, subtotal, request);
    }

    public List<OrderResponse> getOrdersByUser(String userId) {
        return orderRepository.findByUserId(userId).stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public Page<OrderResponse> searchOrders(String keyword, Pageable pageable) {
        return searchOrders(keyword, "", "", null, null, pageable);
    }

    public Page<OrderResponse> searchOrders(String keyword, String orderStatus, String paymentMethod, LocalDate dateFrom, LocalDate dateTo, Pageable pageable) {
        LocalDateTime from = dateFrom == null ? null : dateFrom.atStartOfDay();
        LocalDateTime to = dateTo == null ? null : dateTo.plusDays(1).atStartOfDay();
        return orderRepository.search(
                clean(keyword),
                clean(orderStatus),
                clean(paymentMethod),
                from,
                to,
                pageable
        ).map(this::toResponse);
    }

    public Order getOrderById(String orderId) {
        return orderRepository.findWithItemsById(orderId).or(() -> orderRepository.findByOrderCode(orderId)).or(() -> orderRepository.findById(orderId)).orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đơn hàng"));
    }

    public List<Order> trackOrders(String orderId, String phone) {
        if (orderId != null && !orderId.isBlank()) { return orderRepository.findWithItemsById(orderId.trim()).or(() -> orderRepository.findByOrderCode(orderId.trim())).map(List::of).orElse(List.of()); } if (phone != null && !phone.isBlank()) { return orderRepository.findByPhone(phone.trim()); } return List.of();



    }

    @Transactional
    public Order updateStatus(String orderId, String orderStatus, String paymentStatus) {
        Order order = getOrderById(orderId);
        if ("CANCELLED".equals(order.getOrderStatus())
                || "RECEIVED".equals(order.getOrderStatus())
                || "RETURN_REQUESTED".equals(order.getOrderStatus())
                || "RETURNED".equals(order.getOrderStatus())) {
            throw new IllegalArgumentException("Đơn hàng hiện không thể cập nhật giao hàng");
        }
        if ("SHIPPING".equals(orderStatus)) {
            throw new IllegalArgumentException("Đơn chờ xử lý chỉ được chuyển sang đang giao bằng thao tác tạo vận đơn");
        }
        if ("DELIVERED".equals(orderStatus) && !"SHIPPING".equals(order.getOrderStatus())) {
            throw new IllegalArgumentException("Chỉ đơn đang giao mới được chuyển sang đã giao");
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
        deductInventoryIfNeeded(order);
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

    public Order updateShippingInfo(String orderId, String shippingCarrier, String trackingCode) {
        Order order = getOrderById(orderId);
        if (!"PENDING".equals(order.getOrderStatus())) {
            throw new IllegalArgumentException("Chỉ đơn chờ xử lý mới được tạo mã vận đơn");
        }
        if (shippingCarrier == null || shippingCarrier.isBlank()) {
            throw new IllegalArgumentException("Vui lòng chọn đơn vị giao hàng");
        }
        if ("CANCELLED".equals(order.getOrderStatus()) || "RETURNED".equals(order.getOrderStatus())) {
            throw new IllegalArgumentException("Đơn đã hủy hoặc đã đổi trả không thể cập nhật vận chuyển");
        }
        order.setShippingCarrier(clean(shippingCarrier));
        order.setTrackingCode(generateTrackingCode(order));
        order.setOrderStatus("SHIPPING");
        Order saved = orderRepository.save(order);
        addHistory(saved, "Admin cập nhật thông tin vận chuyển", "ADMIN");
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

    @Transactional
    public Order markReceived(String orderId, String userId) {
        Order order = getOwnedOrder(orderId, userId);
        if (!"SHIPPING".equals(order.getOrderStatus()) && !"DELIVERED".equals(order.getOrderStatus())) {
            throw new IllegalArgumentException("Chỉ có thể xác nhận đã nhận khi đơn đang giao hoặc đã giao");
        }
        order.setOrderStatus("RECEIVED");
        if ("COD".equals(order.getPaymentMethod())) {
            order.setPaymentStatus("PAID");
        }
        deductInventoryIfNeeded(order);
        Order saved = orderRepository.save(order);
        addHistory(saved, "User xác nhận đã nhận hàng", "USER");
        return saved;
    }

    @Transactional
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
        addReturnHistory(saved, "PENDING", reason.trim(), null, "USER");
        return saved;
    }

    @Transactional
    public Order reviewReturn(String orderId, String decision, String adminNote) {
        Order order = getOrderById(orderId);
        if (!"RETURN_REQUESTED".equals(order.getOrderStatus())) {
            throw new IllegalArgumentException("Đơn hàng chưa có yêu cầu đổi trả");
        }
        if ("APPROVED".equals(decision)) {
            order.setReturnStatus("APPROVED");
            order.setOrderStatus("RETURNED");
            restoreInventoryIfNeeded(order);
        } else if ("REJECTED".equals(decision)) {
            order.setReturnStatus("REJECTED");
            order.setOrderStatus("RECEIVED");
        } else {
            throw new IllegalArgumentException("Quyết định đổi trả không hợp lệ");
        }
        order.setAdminNote(adminNote);
        Order saved = orderRepository.save(order);
        addHistory(saved, "Admin " + ("APPROVED".equals(decision) ? "duyệt" : "từ chối") + " đổi trả: " + safe(adminNote), "ADMIN");
        addReturnHistory(saved, order.getReturnStatus(), order.getReturnReason(), adminNote, "ADMIN");
        return saved;
    }

    public List<OrderStatusHistory> getHistory(String orderId) {
        return orderStatusHistoryRepository.findByOrderIdOrderByCreatedAtAsc(orderId);
    }

    public List<ReturnHistory> getReturnHistory(String orderId) {
        return returnHistoryRepository.findByOrderIdOrderByCreatedAtAsc(orderId);
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
                    Product product = productService.getProductById(item.getProductId());
                    OrderItem orderItem = new OrderItem(
                            item.getProductId(),
                            item.getProductName(),
                            item.getImageUrl(),
                            item.getPrice(),
                            item.getQuantity()
                    );
                    orderItem.setCostAtSale(product == null ? 0 : product.getAverageCost());
                    orderItem.setOrder(order);
                    return orderItem;
                }).collect(Collectors.toList());

    }

    private OrderResponse toResponse(Order order) {
        OrderItem firstItem = (order.getItems() == null || order.getItems().isEmpty()) ? null : order.getItems().get(0);
        return new OrderResponse(
                order.getId(),
                order.getCreatedAt() != null ? order.getCreatedAt().toString() : "",
                statusClass(order),
                statusText(order),
                order.getOrderStatus(),
                order.getPaymentStatus(),
                firstItem == null ? "" : firstItem.getImageUrl(),
                firstItem == null ? "" : firstItem.getProductName(),
                order.getItems() == null ? 0 : order.getItems().stream().mapToInt(OrderItem::getQuantity).sum(),
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

    private void addReturnHistory(Order order, String returnStatus, String reason, String adminNote, String changedBy) {
        returnHistoryRepository.save(new ReturnHistory(order.getId(), returnStatus, reason, adminNote, changedBy));
    }

    private void deductInventoryIfNeeded(Order order) {
        if (order.isInventoryDeducted()) {
            return;
        }
        if (!"DELIVERED".equals(order.getOrderStatus()) && !"RECEIVED".equals(order.getOrderStatus())) {
            return;
        }
        for (OrderItem item : order.getItems()) {
            productService.decreaseStock(item.getProductId(), item.getQuantity(), "ORDER", order.getId(), "Xuất kho theo đơn " + order.getId());
        }
        order.setInventoryDeducted(true);
    }

    private void restoreInventoryIfNeeded(Order order) {
        if (!order.isInventoryDeducted()) {
            return;
        }
        for (OrderItem item : order.getItems()) {
            productService.increaseStock(item.getProductId(), item.getQuantity(), "RETURN", order.getId(), "Hoàn kho đổi trả " + order.getId());
        }
        order.setInventoryDeducted(false);
    }

    private String safe(String value) {
        return value == null ? "" : value.trim();
    }

    private String clean(String value) {
        return value == null ? "" : value.trim();
    }

    private String generateTrackingCode(Order order) {
        String source = order.getId() == null ? String.valueOf(System.currentTimeMillis()) : order.getId().replaceAll("[^0-9A-Za-z]", "");
        String suffix = source.length() > 10 ? source.substring(source.length() - 10) : source;
        return "VD-" + suffix + "-" + (System.currentTimeMillis() % 10000);
    }
}
