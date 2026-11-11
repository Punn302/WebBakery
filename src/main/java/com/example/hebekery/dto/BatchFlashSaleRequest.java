package com.example.hebekery.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Yêu cầu kích hoạt hoặc điều chỉnh Flash Sale xả hàng cận date")
public class BatchFlashSaleRequest {

    @Schema(description = "Tỷ lệ giảm giá (% từ 0 đến 90)", example = "35.0")
    @NotNull(message = "Tỷ lệ giảm giá không được để trống")
    @Min(value = 0, message = "Tỷ lệ giảm giá tối thiểu là 0%")
    @Max(value = 90, message = "Tỷ lệ giảm giá tối đa là 90%")
    private Double discountPercent;

    @Schema(description = "Ghi chú chiến dịch xả hàng", example = "Chiến dịch Cứu Bánh Lành cận date")
    private String note;

    public Double getDiscountPercent() {
        return discountPercent;
    }

    public void setDiscountPercent(Double discountPercent) {
        this.discountPercent = discountPercent;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }
}
