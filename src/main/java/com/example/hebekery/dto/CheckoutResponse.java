package com.example.hebekery.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Kết quả khởi tạo đơn hàng thanh toán")
public class CheckoutResponse {

    @Schema(description = "Mã định danh đơn hàng", example = "ORD-20261105-001")
    private String orderId;

    @Schema(description = "Phương thức thanh toán đã chọn (COD, SEPAY, MOMO)", example = "COD")
    private String paymentMethod;

    @Schema(description = "Trạng thái thanh toán (UNPAID, PAID, FAILED)", example = "UNPAID")
    private String paymentStatus;

    @Schema(description = "URL thanh toán (nếu là cổng trực tuyến hoặc VietQR)", example = "https://qr.sepay.vn/img?acc=...")
    private String payUrl;

    @Schema(description = "Thông báo hướng dẫn người dùng", example = "Đặt hàng thành công")
    private String message;

    public CheckoutResponse() {
    }

    public CheckoutResponse(String orderId, String paymentMethod, String paymentStatus, String payUrl, String message) {
        this.orderId = orderId;
        this.paymentMethod = paymentMethod;
        this.paymentStatus = paymentStatus;
        this.payUrl = payUrl;
        this.message = message;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public String getPayUrl() {
        return payUrl;
    }

    public void setPayUrl(String payUrl) {
        this.payUrl = payUrl;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
