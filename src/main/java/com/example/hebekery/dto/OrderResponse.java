package com.example.hebekery.dto;

public class OrderResponse {
    private String id;
    private String date;
    private String statusClass;
    private String statusText;
    private int itemCount;
    private double total;

    public OrderResponse() {
    }

    public OrderResponse(String id, String date, String statusClass, String statusText, int itemCount, double total) {
        this.id = id;
        this.date = date;
        this.statusClass = statusClass;
        this.statusText = statusText;
        this.itemCount = itemCount;
        this.total = total;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getStatusClass() {
        return statusClass;
    }

    public void setStatusClass(String statusClass) {
        this.statusClass = statusClass;
    }

    public String getStatusText() {
        return statusText;
    }

    public void setStatusText(String statusText) {
        this.statusText = statusText;
    }

    public int getItemCount() {
        return itemCount;
    }

    public void setItemCount(int itemCount) {
        this.itemCount = itemCount;
    }

    public double getTotal() {
        return total;
    }

    public void setTotal(double total) {
        this.total = total;
    }
}
