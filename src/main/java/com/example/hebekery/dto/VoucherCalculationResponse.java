package com.example.hebekery.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Kết quả thẩm định và tính toán giảm giá của voucher")
public class VoucherCalculationResponse {

    private boolean valid;
    private String message;
    private String code;
    private String discountType;
    private double discountAmount;
    private double finalAmount;

    public VoucherCalculationResponse() {
    }

    public VoucherCalculationResponse(boolean valid, String message, String code, String discountType, double discountAmount, double finalAmount) {
        this.valid = valid;
        this.message = message;
        this.code = code;
        this.discountType = discountType;
        this.discountAmount = discountAmount;
        this.finalAmount = finalAmount;
    }

    public static VoucherCalculationResponse invalid(String message, double originalAmount) {
        return new VoucherCalculationResponse(false, message, null, null, 0.0, originalAmount);
    }

    public boolean isValid() {
        return valid;
    }

    public void setValid(boolean valid) {
        this.valid = valid;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getDiscountType() {
        return discountType;
    }

    public void setDiscountType(String discountType) {
        this.discountType = discountType;
    }

    public double getDiscountAmount() {
        return discountAmount;
    }

    public void setDiscountAmount(double discountAmount) {
        this.discountAmount = discountAmount;
    }

    public double getFinalAmount() {
        return finalAmount;
    }

    public void setFinalAmount(double finalAmount) {
        this.finalAmount = finalAmount;
    }
}
