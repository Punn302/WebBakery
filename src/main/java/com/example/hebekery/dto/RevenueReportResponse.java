package com.example.hebekery.dto;

import java.util.List;

public class RevenueReportResponse {
    private double revenueTotal;
    private long revenueOrderCount;
    private long cancelledOrderCount;
    private double importCostTotal;
    private long importedQuantityTotal;
    private double profitTotal;
    private List<WeeklyRevenuePoint> revenueTrend;
    private List<TopSellingProduct> topSellingProducts;

    public RevenueReportResponse() {
    }

    public double getRevenueTotal() {
        return revenueTotal;
    }

    public void setRevenueTotal(double revenueTotal) {
        this.revenueTotal = revenueTotal;
    }

    public long getRevenueOrderCount() {
        return revenueOrderCount;
    }

    public void setRevenueOrderCount(long revenueOrderCount) {
        this.revenueOrderCount = revenueOrderCount;
    }

    public long getCancelledOrderCount() {
        return cancelledOrderCount;
    }

    public void setCancelledOrderCount(long cancelledOrderCount) {
        this.cancelledOrderCount = cancelledOrderCount;
    }

    public double getImportCostTotal() {
        return importCostTotal;
    }

    public void setImportCostTotal(double importCostTotal) {
        this.importCostTotal = importCostTotal;
    }

    public long getImportedQuantityTotal() {
        return importedQuantityTotal;
    }

    public void setImportedQuantityTotal(long importedQuantityTotal) {
        this.importedQuantityTotal = importedQuantityTotal;
    }

    public double getProfitTotal() {
        return profitTotal;
    }

    public void setProfitTotal(double profitTotal) {
        this.profitTotal = profitTotal;
    }

    public List<WeeklyRevenuePoint> getRevenueTrend() {
        return revenueTrend;
    }

    public void setRevenueTrend(List<WeeklyRevenuePoint> revenueTrend) {
        this.revenueTrend = revenueTrend;
    }

    public List<TopSellingProduct> getTopSellingProducts() {
        return topSellingProducts;
    }

    public void setTopSellingProducts(List<TopSellingProduct> topSellingProducts) {
        this.topSellingProducts = topSellingProducts;
    }
}
