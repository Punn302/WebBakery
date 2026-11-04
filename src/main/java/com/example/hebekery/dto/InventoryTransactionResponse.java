package com.example.hebekery.dto;

import com.example.hebekery.model.InventoryTransaction;

public class InventoryTransactionResponse {
    private Long id;
    private String productId;
    private String productName;
    private String transactionType;
    private int quantity;
    private int stockAfter;
    private double unitCost;
    private String referenceType;
    private String referenceId;
    private String note;
    private String createdAt;

    public InventoryTransactionResponse() {
    }

    public static InventoryTransactionResponse from(InventoryTransaction tx) {
        if (tx == null) {
            return null;
        }
        InventoryTransactionResponse dto = new InventoryTransactionResponse();
        dto.setId(tx.getId());
        dto.setProductId(tx.getProductId());
        dto.setProductName(tx.getProductName());
        dto.setTransactionType(tx.getTransactionType());
        dto.setQuantity(tx.getQuantity());
        dto.setStockAfter(tx.getStockAfter());
        dto.setUnitCost(tx.getUnitCost());
        dto.setReferenceType(tx.getReferenceType());
        dto.setReferenceId(tx.getReferenceId());
        dto.setNote(tx.getNote());
        dto.setCreatedAt(tx.getCreatedAt() != null ? tx.getCreatedAt().toString() : null);
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getTransactionType() {
        return transactionType;
    }

    public void setTransactionType(String transactionType) {
        this.transactionType = transactionType;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public int getStockAfter() {
        return stockAfter;
    }

    public void setStockAfter(int stockAfter) {
        this.stockAfter = stockAfter;
    }

    public double getUnitCost() {
        return unitCost;
    }

    public void setUnitCost(double unitCost) {
        this.unitCost = unitCost;
    }

    public String getReferenceType() {
        return referenceType;
    }

    public void setReferenceType(String referenceType) {
        this.referenceType = referenceType;
    }

    public String getReferenceId() {
        return referenceId;
    }

    public void setReferenceId(String referenceId) {
        this.referenceId = referenceId;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }
}
