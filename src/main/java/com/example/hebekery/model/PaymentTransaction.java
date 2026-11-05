package com.example.hebekery.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "payment_transactions")
public class PaymentTransaction {

    @Id
    private String id;

    @Column(name = "order_id", nullable = false, length = 64)
    private String orderId;

    @Column(name = "reference_code", nullable = false, unique = true, length = 128)
    private String referenceCode;

    @Column(length = 64)
    private String gateway;

    @Column(name = "account_number", length = 64)
    private String accountNumber;

    @Column(nullable = false)
    private double amount;

    @Column(name = "transfer_type", length = 32)
    private String transferType;

    @Column(length = 500)
    private String content;

    @Column(name = "transaction_date")
    private LocalDateTime transactionDate;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public PaymentTransaction() {
    }

    public PaymentTransaction(String id, String orderId, String referenceCode, String gateway,
                              String accountNumber, double amount, String transferType,
                              String content, LocalDateTime transactionDate) {
        this.id = id;
        this.orderId = orderId;
        this.referenceCode = referenceCode;
        this.gateway = gateway;
        this.accountNumber = accountNumber;
        this.amount = amount;
        this.transferType = transferType;
        this.content = content;
        this.transactionDate = transactionDate;
        this.createdAt = LocalDateTime.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public String getReferenceCode() {
        return referenceCode;
    }

    public void setReferenceCode(String referenceCode) {
        this.referenceCode = referenceCode;
    }

    public String getGateway() {
        return gateway;
    }

    public void setGateway(String gateway) {
        this.gateway = gateway;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public void setAccountNumber(String accountNumber) {
        this.accountNumber = accountNumber;
    }

    public double getAmount() {
        return amount;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }

    public String getTransferType() {
        return transferType;
    }

    public void setTransferType(String transferType) {
        this.transferType = transferType;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public LocalDateTime getTransactionDate() {
        return transactionDate;
    }

    public void setTransactionDate(LocalDateTime transactionDate) {
        this.transactionDate = transactionDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
