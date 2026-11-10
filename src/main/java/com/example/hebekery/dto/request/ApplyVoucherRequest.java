package com.example.hebekery.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

@Schema(description = "Yêu cầu kiểm tra & áp dụng mã giảm giá cho giỏ hàng")
public class ApplyVoucherRequest {

    @Schema(description = "Mã voucher (ví dụ: HB10, HB20, FREESHIP)", example = "HB10")
    @NotBlank(message = "Mã voucher không được để trống")
    private String code;

    @Schema(description = "Tổng giá trị tạm tính của đơn hàng (VNĐ)", example = "350000")
    @Positive(message = "Giá trị đơn hàng phải lớn hơn 0")
    private double orderAmount;

    public ApplyVoucherRequest() {
    }

    public ApplyVoucherRequest(String code, double orderAmount) {
        this.code = code;
        this.orderAmount = orderAmount;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public double getOrderAmount() {
        return orderAmount;
    }

    public void setOrderAmount(double orderAmount) {
        this.orderAmount = orderAmount;
    }
}
