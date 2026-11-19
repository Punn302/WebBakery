package com.example.hebekery.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Tóm tắt thông tin đơn hàng trong danh sách")
public class OrderResponse {

    @Schema(description = "Mã định danh kỹ thuật đơn hàng", example = "ORD-UUID-1234")
    private String id;

    @Schema(description = "Mã đơn hàng hiển thị khách hàng", example = "HBK-20261105-001")
    private String orderCode;

    @Schema(description = "Ngày tạo đơn", example = "05/11/2026")
    private String date;

    @Schema(description = "Class CSS hiển thị màu badge", example = "bg-green-100 text-green-800")
    private String statusClass;

    @Schema(description = "Nhãn trạng thái đơn hiển thị tiếng Việt", example = "Đã giao thành công")
    private String statusText;

    @Schema(description = "Mã trạng thái đơn hàng (PENDING, CONFIRMED, SHIPPING, DELIVERED, CANCELLED)", example = "DELIVERED")
    private String orderStatus;

    @Schema(description = "Mã trạng thái thanh toán (UNPAID, PAID, FAILED)", example = "PAID")
    private String paymentStatus;

    @Schema(description = "Ảnh đại diện sản phẩm đầu tiên trong đơn", example = "https://res.cloudinary.com/hebekery/image/upload/v1/products/banh-mi.jpg")
    private String imageUrl;

    @Schema(description = "Tên sản phẩm đại diện trong đơn", example = "Bánh Mì Nguyên Cám Hạt Óc Chó")
    private String productName;

    @Schema(description = "Tổng số lượng mặt hàng", example = "2")
    private int itemCount;

    @Schema(description = "Tổng tiền thanh toán (VNĐ)", example = "130000.0")
    private double total;

    @Schema(description = "Họ và tên khách hàng đặt bánh", example = "Nguyễn Văn A")
    private String customerName;

    @Schema(description = "Số điện thoại nhận hàng", example = "0987654321")
    private String phone;

    @Schema(description = "Địa chỉ giao hàng", example = "123 Đường Bánh Mì, Q. Tân Bình, TP. HCM")
    private String address;

    @Schema(description = "Phương thức thanh toán (COD, VIETQR)", example = "VIETQR")
    private String paymentMethod;

    @Schema(description = "Thời gian tạo đơn định dạng ISO", example = "2026-11-19T10:00:00")
    private String createdAt;

    @Schema(description = "Đơn vị vận chuyển (GHN, GHTK, ViettelPost)", example = "GiaoHangNhanh")
    private String shippingCarrier;

    @Schema(description = "Mã vận đơn giao hàng", example = "GHN-882910")
    private String trackingCode;

    public OrderResponse() {
    }

    public OrderResponse(String id, String date, String statusClass, String statusText, int itemCount, double total) {
        this.id = id;
        this.orderCode = id;
        this.date = date;
        this.statusClass = statusClass;
        this.statusText = statusText;
        this.itemCount = itemCount;
        this.total = total;
    }

    public OrderResponse(String id, String date, String statusClass, String statusText, String orderStatus,
                         String paymentStatus, String imageUrl, String productName, int itemCount, double total) {
        this.id = id;
        this.orderCode = id;
        this.date = date;
        this.statusClass = statusClass;
        this.statusText = statusText;
        this.orderStatus = orderStatus;
        this.paymentStatus = paymentStatus;
        this.imageUrl = imageUrl;
        this.productName = productName;
        this.itemCount = itemCount;
        this.total = total;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getOrderCode() {
        return orderCode;
    }

    public void setOrderCode(String orderCode) {
        this.orderCode = orderCode;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getStatusClass() {
        return statusClass;
    }

    public void setStatusClass(String statusClass) {
        this.statusClass = statusClass;
    }

    public String getStatusText() {
        return statusText;
    }

    public void setStatusText(String statusText) {
        this.statusText = statusText;
    }

    public String getOrderStatus() {
        return orderStatus;
    }

    public void setOrderStatus(String orderStatus) {
        this.orderStatus = orderStatus;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public int getItemCount() {
        return itemCount;
    }

    public void setItemCount(int itemCount) {
        this.itemCount = itemCount;
    }

    public double getTotal() {
        return total;
    }

    public void setTotal(double total) {
        this.total = total;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getCreatedAt() {
        return createdAt != null ? createdAt : date;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public String getShippingCarrier() {
        return shippingCarrier;
    }

    public void setShippingCarrier(String shippingCarrier) {
        this.shippingCarrier = shippingCarrier;
    }

    public String getTrackingCode() {
        return trackingCode;
    }

    public void setTrackingCode(String trackingCode) {
        this.trackingCode = trackingCode;
    }
}
