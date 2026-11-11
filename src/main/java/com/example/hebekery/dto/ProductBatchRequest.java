package com.example.hebekery.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

@Schema(description = "Yêu cầu tạo hoặc cập nhật lô sản xuất bánh")
public class ProductBatchRequest {

    @Schema(description = "ID / SKU sản phẩm bánh", example = "P001")
    @NotBlank(message = "Sản phẩm không được để trống")
    private String productId;

    @Schema(description = "Mã lô bánh (tự tạo hoặc nhập)", example = "LOT-202611-BISC01")
    private String batchCode;

    @Schema(description = "Ngày sản xuất / nướng bánh (NSX)", example = "2026-11-10")
    @NotNull(message = "Ngày sản xuất không được để trống")
    private LocalDate manufactureDate;

    @Schema(description = "Hạn sử dụng (HSD)", example = "2027-02-10")
    @NotNull(message = "Hạn sử dụng không được để trống")
    private LocalDate expiryDate;

    @Schema(description = "Số lượng bánh nướng mẻ này", example = "50")
    @NotNull(message = "Số lượng ban đầu không được để trống")
    @Min(value = 1, message = "Số lượng ban đầu phải lớn hơn 0")
    private Integer initialQuantity;

    @Schema(description = "Ghi chú chất lượng mẻ bánh hoặc nhiệt độ lò", example = "Mẻ bánh nướng sáng sớm, nhiệt độ 160 độ C")
    private String note;

    public String getProductId() {
        return productId;
    }

    public void setProductId(String productId) {
        this.productId = productId;
    }

    public String getBatchCode() {
        return batchCode;
    }

    public void setBatchCode(String batchCode) {
        this.batchCode = batchCode;
    }

    public LocalDate getManufactureDate() {
        return manufactureDate;
    }

    public void setManufactureDate(LocalDate manufactureDate) {
        this.manufactureDate = manufactureDate;
    }

    public LocalDate getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDate expiryDate) {
        this.expiryDate = expiryDate;
    }

    public Integer getInitialQuantity() {
        return initialQuantity;
    }

    public void setInitialQuantity(Integer initialQuantity) {
        this.initialQuantity = initialQuantity;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }
}
