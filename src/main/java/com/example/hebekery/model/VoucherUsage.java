package com.example.hebekery.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "voucher_usages")
public class VoucherUsage {

    @Id
    private String id;

    @Column(name = "voucher_id", nullable = false, length = 64)
    private String voucherId;

    @Column(name = "user_id", nullable = false, length = 64)
    private String userId;

    @Column(name = "order_id", nullable = false, length = 64)
    private String orderId;

    @Column(name = "used_at", nullable = false)
    private LocalDateTime usedAt = LocalDateTime.now();

    public VoucherUsage() {
    }

    public VoucherUsage(String id, String voucherId, String userId, String orderId) {
        this.id = id;
        this.voucherId = voucherId;
        this.userId = userId;
        this.orderId = orderId;
        this.usedAt = LocalDateTime.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getVoucherId() {
        return voucherId;
    }

    public void setVoucherId(String voucherId) {
        this.voucherId = voucherId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public LocalDateTime getUsedAt() {
        return usedAt;
    }

    public void setUsedAt(LocalDateTime usedAt) {
        this.usedAt = usedAt;
    }
}
