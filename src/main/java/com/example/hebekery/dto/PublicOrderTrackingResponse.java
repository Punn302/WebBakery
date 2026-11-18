package com.example.hebekery.dto;

import com.example.hebekery.model.Order;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class PublicOrderTrackingResponse {
    private String orderCode;
    private String customerName;
    private String phone;
    private String address;
    private String paymentMethod;
    private String paymentStatus;
    private String orderStatus;
    private String shippingCarrier;
    private String trackingCode;
    private double total;
    private String createdAt;
    private List<OrderItemResponse> items;

    public PublicOrderTrackingResponse() {
    }

    public static PublicOrderTrackingResponse from(Order order) {
        if (order == null) {
            return null;
        }
        PublicOrderTrackingResponse dto = new PublicOrderTrackingResponse();
        dto.setOrderCode(order.getOrderCode() != null ? order.getOrderCode() : order.getId());
        dto.setCustomerName(order.getCustomerName());
        dto.setPhone(maskPhone(order.getPhone()));
        dto.setAddress(maskAddress(order.getAddress()));
        dto.setPaymentMethod(order.getPaymentMethod());
        dto.setPaymentStatus(order.getPaymentStatus());
        dto.setOrderStatus(order.getOrderStatus());
        dto.setShippingCarrier(order.getShippingCarrier());
        dto.setTrackingCode(order.getTrackingCode());
        dto.setTotal(order.getTotal());
        dto.setCreatedAt(order.getCreatedAt() != null ? order.getCreatedAt().toString() : null);

        if (order.getItems() != null) {
            dto.setItems(order.getItems().stream()
                    .map(OrderItemResponse::from)
                    .collect(Collectors.toList()));
        } else {
            dto.setItems(Collections.emptyList());
        }

        return dto;
    }

    public static String maskPhone(String phone) {
        if (phone == null || phone.isBlank()) {
            return "";
        }
        String clean = phone.trim();
        if (clean.length() <= 4) {
            return "***";
        }
        if (clean.length() <= 7) {
            return clean.substring(0, 2) + "***" + clean.substring(clean.length() - 2);
        }
        return clean.substring(0, 3) + "***" + clean.substring(clean.length() - 4);
    }

    public static String maskAddress(String address) {
        if (address == null || address.isBlank()) {
            return "";
        }
        String clean = address.trim();
        String[] parts = clean.split(",");
        if (parts.length > 2) {
            return "***, " + parts[parts.length - 2].trim() + ", " + parts[parts.length - 1].trim();
        } else if (parts.length == 2) {
            return "***, " + parts[1].trim();
        } else {
            return "***";
        }
    }

    public String getOrderCode() {
        return orderCode;
    }

    public void setOrderCode(String orderCode) {
        this.orderCode = orderCode;
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

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public String getOrderStatus() {
        return orderStatus;
    }

    public void setOrderStatus(String orderStatus) {
        this.orderStatus = orderStatus;
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

    public double getTotal() {
        return total;
    }

    public void setTotal(double total) {
        this.total = total;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public List<OrderItemResponse> getItems() {
        return items;
    }

    public void setItems(List<OrderItemResponse> items) {
        this.items = items;
    }
}
