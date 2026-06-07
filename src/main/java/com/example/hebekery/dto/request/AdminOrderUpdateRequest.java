package com.example.hebekery.dto.request;

public class AdminOrderUpdateRequest {
    private String orderStatus;
    private String paymentStatus;

    public String getOrderStatus() { return orderStatus; }
    public void setOrderStatus(String orderStatus) { this.orderStatus = orderStatus; }
    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }
}
