package com.example.hebekery.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Thông tin trạng thái thanh toán đơn hàng phục vụ Polling realtime")
public class PaymentStatusResponse {

    @Schema(description = "Mã ID kỹ thuật của đơn hàng", example = "ORD-123456")
    private String orderId;

    @Schema(description = "Mã đơn hàng hiển thị", example = "HBK-20261105-ABC")
    private String orderCode;

    @Schema(description = "Trạng thái tiến trình đơn (PENDING, PROCESSING, SHIPPING...)", example = "PROCESSING")
    private String orderStatus;

    @Schema(description = "Trạng thái thanh toán (PENDING, PAID)", example = "PAID")
    private String paymentStatus;

    @Schema(description = "Cờ đánh dấu đã thanh toán thành công hay chưa", example = "true")
    private boolean isPaid;

    @Schema(description = "Tổng tiền của đơn hàng", example = "280000")
    private double total;

    public PaymentStatusResponse() {
    }

    public PaymentStatusResponse(String orderId, String orderCode, String orderStatus,
                                 String paymentStatus, boolean isPaid, double total) {
        this.orderId = orderId;
        this.orderCode = orderCode;
        this.orderStatus = orderStatus;
        this.paymentStatus = paymentStatus;
        this.isPaid = isPaid;
        this.total = total;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public String getOrderCode() {
        return orderCode;
    }

    public void setOrderCode(String orderCode) {
        this.orderCode = orderCode;
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

    public boolean isPaid() {
        return isPaid;
    }

    public void setPaid(boolean paid) {
        isPaid = paid;
    }

    public double getTotal() {
        return total;
    }

    public void setTotal(double total) {
        this.total = total;
    }
}
