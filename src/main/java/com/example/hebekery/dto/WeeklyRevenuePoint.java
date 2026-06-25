package com.example.hebekery.dto;

public class WeeklyRevenuePoint {
    private String label;
    private double revenue;
    private int percent;

    public WeeklyRevenuePoint(String label, double revenue, int percent) {
        this.label = label;
        this.revenue = revenue;
        this.percent = percent;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public double getRevenue() {
        return revenue;
    }

    public void setRevenue(double revenue) {
        this.revenue = revenue;
    }

    public int getPercent() {
        return percent;
    }

    public void setPercent(int percent) {
        this.percent = percent;
    }
}
