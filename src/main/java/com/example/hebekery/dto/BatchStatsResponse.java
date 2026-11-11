package com.example.hebekery.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Thống kê tình trạng hạn sử dụng các lô bánh")
public class BatchStatsResponse {

    private long totalBatches;
    private long activeBatches;
    private long nearExpiryBatches;
    private long expiredBatches;
    private long flashSaleBatches;

    public BatchStatsResponse() {
    }

    public BatchStatsResponse(long totalBatches, long activeBatches, long nearExpiryBatches, long expiredBatches, long flashSaleBatches) {
        this.totalBatches = totalBatches;
        this.activeBatches = activeBatches;
        this.nearExpiryBatches = nearExpiryBatches;
        this.expiredBatches = expiredBatches;
        this.flashSaleBatches = flashSaleBatches;
    }

    public long getTotalBatches() {
        return totalBatches;
    }

    public void setTotalBatches(long totalBatches) {
        this.totalBatches = totalBatches;
    }

    public long getActiveBatches() {
        return activeBatches;
    }

    public void setActiveBatches(long activeBatches) {
        this.activeBatches = activeBatches;
    }

    public long getNearExpiryBatches() {
        return nearExpiryBatches;
    }

    public void setNearExpiryBatches(long nearExpiryBatches) {
        this.nearExpiryBatches = nearExpiryBatches;
    }

    public long getExpiredBatches() {
        return expiredBatches;
    }

    public void setExpiredBatches(long expiredBatches) {
        this.expiredBatches = expiredBatches;
    }

    public long getFlashSaleBatches() {
        return flashSaleBatches;
    }

    public void setFlashSaleBatches(long flashSaleBatches) {
        this.flashSaleBatches = flashSaleBatches;
    }
}
