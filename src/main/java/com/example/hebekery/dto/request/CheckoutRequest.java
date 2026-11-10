package com.example.hebekery.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

@Schema(description = "Thông tin đặt hàng và thanh toán")
public class CheckoutRequest {

    @Schema(description = "Họ tên người nhận hàng", example = "Nguyễn Văn A")
    @NotBlank(message = "Họ tên không được để trống")
    private String customerName;

    @Schema(description = "Số điện thoại nhận hàng", example = "0987654321")
    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(regexp = "^[0-9]{10,11}$", message = "Số điện thoại không hợp lệ")
    private String phone;

    @Schema(description = "Địa chỉ chi tiết nhận hàng", example = "123 Đường Nguyễn Trãi, Quận 1, TP. Hồ Chí Minh")
    @NotBlank(message = "Địa chỉ không được để trống")
    private String address;

    @Schema(description = "Ghi chú giao hàng", example = "Giao vào giờ hành chính")
    private String note;

    @Schema(description = "Phương thức thanh toán (COD, MOMO, SEPAY)", example = "COD")
    @NotBlank(message = "Phương thức thanh toán không được để trống")
    @Pattern(regexp = "COD|MOMO|SEPAY|VIETQR", message = "Phương thức thanh toán không hợp lệ")
    private String paymentMethod;

    @Schema(description = "Mã voucher giảm giá (nếu có)", example = "HB10")
    private String voucherCode;

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

    public String getVoucherCode() {
        return voucherCode;
    }

    public void setVoucherCode(String voucherCode) {
        this.voucherCode = voucherCode;
    }
}
