package com.example.hebekery.dto.request;

import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public class PurchaseReceiptBatchRequest {

    @NotEmpty(message = "Danh sách sản phẩm không được để trống")
    private List<String> productIds;

    @NotEmpty(message = "Danh sách số lượng không được để trống")
    private List<Integer> quantities;

    @NotEmpty(message = "Danh sách giá nhập không được để trống")
    private List<Double> unitCosts;

    private String supplier;
    private String note;

    public PurchaseReceiptBatchRequest() {
    }

    public List<String> getProductIds() {
        return productIds;
    }

    public void setProductIds(List<String> productIds) {
        this.productIds = productIds;
    }

    public List<Integer> getQuantities() {
        return quantities;
    }

    public void setQuantities(List<Integer> quantities) {
        this.quantities = quantities;
    }

    public List<Double> getUnitCosts() {
        return unitCosts;
    }

    public void setUnitCosts(List<Double> unitCosts) {
        this.unitCosts = unitCosts;
    }

    public String getSupplier() {
        return supplier;
    }

    public void setSupplier(String supplier) {
        this.supplier = supplier;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }
}
