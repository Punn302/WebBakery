package com.example.hebekery.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class CheckoutRequest {
    @NotBlank(message = "Ho ten khong duoc de trong")
    private String customerName;

    @NotBlank(message = "So dien thoai khong duoc de trong")
    @Pattern(regexp = "^[0-9]{10,11}$", message = "So dien thoai khong hop le")
    private String phone;

    @NotBlank(message = "Dia chi khong duoc de trong")
    private String address;

    private String note;

    @NotBlank(message = "Phuong thuc thanh toan khong duoc de trong")
    @Pattern(regexp = "COD|MOMO", message = "Phuong thuc thanh toan khong hop le")
    private String paymentMethod;

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

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }
}
