package com.example.hebekery.dto;

import com.example.hebekery.model.PurchaseReceipt;

public class PurchaseReceiptResponse {
    private String id;
    private String receiptCode;
    private String productId;
    private String productName;
    private String supplier;
    private int quantity;
    private double unitCost;
    private double totalCost;
    private String importedAt;
    private String note;

    public PurchaseReceiptResponse() {
    }

    public static PurchaseReceiptResponse from(PurchaseReceipt pr) {
        if (pr == null) {
            return null;
        }
        PurchaseReceiptResponse dto = new PurchaseReceiptResponse();
        dto.setId(pr.getId());
        dto.setReceiptCode(pr.getReceiptCode());
        dto.setProductId(pr.getProductId());
        dto.setProductName(pr.getProductName());
        dto.setSupplier(pr.getSupplier());
        dto.setQuantity(pr.getQuantity());
        dto.setUnitCost(pr.getUnitCost());
        dto.setTotalCost(pr.getTotalCost());
        dto.setImportedAt(pr.getImportedAt() != null ? pr.getImportedAt().toString() : null);
        dto.setNote(pr.getNote());
        return dto;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getReceiptCode() {
        return receiptCode;
    }

    public void setReceiptCode(String receiptCode) {
        this.receiptCode = receiptCode;
    }

    public String getProductId() {
        return productId;
    }

    public void setProductId(String productId) {
        this.productId = productId;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getSupplier() {
        return supplier;
    }

    public void setSupplier(String supplier) {
        this.supplier = supplier;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public double getUnitCost() {
        return unitCost;
    }

    public void setUnitCost(double unitCost) {
        this.unitCost = unitCost;
    }

    public double getTotalCost() {
        return totalCost;
    }

    public void setTotalCost(double totalCost) {
        this.totalCost = totalCost;
    }

    public String getImportedAt() {
        return importedAt;
    }

    public void setImportedAt(String importedAt) {
        this.importedAt = importedAt;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }
}
