package com.example.hebekery.dto;

public class OrderResponse {
    private String id;
    private String orderCode;
    private String date;
    private String statusClass;
    private String statusText;
    private String orderStatus;
    private String paymentStatus;
    private String imageUrl;
    private String productName;
    private int itemCount;
    private double total;

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
}
