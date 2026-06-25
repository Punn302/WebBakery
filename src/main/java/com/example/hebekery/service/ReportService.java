package com.example.hebekery.service;

import com.example.hebekery.dto.WeeklyRevenuePoint;
import com.example.hebekery.dto.TopSellingProduct;
import com.example.hebekery.model.Order;
import com.example.hebekery.model.OrderItem;
import com.example.hebekery.repository.OrderRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class ReportService {
    private static final DateTimeFormatter DATE_LABEL_FORMAT = DateTimeFormatter.ofPattern("dd/MM");

    private final OrderRepository orderRepository;
    private final PurchaseReceiptService purchaseReceiptService;

    public ReportService(OrderRepository orderRepository, PurchaseReceiptService purchaseReceiptService) {
        this.orderRepository = orderRepository;
        this.purchaseReceiptService = purchaseReceiptService;
    }

    public double getRevenueTotal() {
        return validRevenueOrders().stream().mapToDouble(Order::getTotal).sum();
    }

    public double getRevenueTotal(LocalDate from, LocalDate to) {
        return validRevenueOrders(from, to).stream().mapToDouble(Order::getTotal).sum();
    }

    public long getRevenueOrderCount() {
        return validRevenueOrders().size();
    }

    public long getRevenueOrderCount(LocalDate from, LocalDate to) {
        return validRevenueOrders(from, to).size();
    }

    public long getCancelledOrderCount() {
        return orderRepository.findAll().stream()
                .filter(order -> "CANCELLED".equals(order.getOrderStatus()))
                .count();
    }

    public long getCancelledOrderCount(LocalDate from, LocalDate to) {
        return orderRepository.findAll().stream()
                .filter(order -> "CANCELLED".equals(order.getOrderStatus()))
                .filter(order -> inRange(order, from, to))
                .count();
    }

    public double getImportCostTotal() {
        return purchaseReceiptService.getTotalImportCost();
    }

    public double getImportCostTotal(LocalDate from, LocalDate to) {
        return purchaseReceiptService.getTotalImportCost(from, to);
    }

    public int getImportedQuantityTotal() {
        return purchaseReceiptService.getTotalImportedQuantity();
    }

    public int getImportedQuantityTotal(LocalDate from, LocalDate to) {
        return purchaseReceiptService.getTotalImportedQuantity(from, to);
    }

    public double getProfitTotal(LocalDate from, LocalDate to) {
        return validRevenueOrders(from, to).stream()
                .flatMap(order -> order.getItems().stream())
                .mapToDouble(item -> item.getTotal() - estimateCost(item))
                .sum();
    }

    public List<TopSellingProduct> getTopSellingProducts(LocalDate from, LocalDate to) {
        Map<String, TopAccumulator> grouped = new LinkedHashMap<>();
        validRevenueOrders(from, to).forEach(order -> order.getItems().forEach(item -> {
            String key = item.getProductId() == null ? item.getProductName() : item.getProductId();
            TopAccumulator accumulator = grouped.computeIfAbsent(key, ignored -> new TopAccumulator(item.getProductId(), item.getProductName()));
            accumulator.quantity += item.getQuantity();
            accumulator.revenue += item.getTotal();
        }));
        return grouped.values().stream()
                .sorted(Comparator.comparingInt(TopAccumulator::getQuantity).reversed())
                .limit(5)
                .map(item -> new TopSellingProduct(item.productId, item.productName, item.quantity, item.revenue))
                .toList();
    }

    public List<WeeklyRevenuePoint> getWeeklyRevenue() {
        return getRevenueTrend(LocalDate.now().minusDays(6), LocalDate.now());
    }

    public List<WeeklyRevenuePoint> getRevenueTrend(LocalDate from, LocalDate to) {
        LocalDate start = from == null ? LocalDate.now().minusDays(6) : from;
        LocalDate end = to == null ? LocalDate.now() : to;
        long days = Math.min(31, Math.max(1, java.time.temporal.ChronoUnit.DAYS.between(start, end) + 1));
        List<Double> values = new ArrayList<>();
        for (int i = 0; i < days; i++) {
            LocalDate date = start.plusDays(i);
            double revenue = validRevenueOrders(start, end).stream()
                    .filter(order -> order.getCreatedAt() != null)
                    .filter(order -> order.getCreatedAt().toLocalDate().isEqual(date))
                    .mapToDouble(Order::getTotal)
                    .sum();
            values.add(revenue);
        }

        double max = values.stream().mapToDouble(Double::doubleValue).max().orElse(0);
        List<WeeklyRevenuePoint> points = new ArrayList<>();
        for (int i = 0; i < values.size(); i++) {
            double revenue = values.get(i);
            int percent = max <= 0 ? 0 : Math.max(8, (int) Math.round((revenue / max) * 100));
            points.add(new WeeklyRevenuePoint(start.plusDays(i).format(DATE_LABEL_FORMAT), revenue, percent));
        }
        return points;
    }

    private List<Order> validRevenueOrders() {
        return orderRepository.findAll().stream()
                .filter(order -> "PAID".equals(order.getPaymentStatus()))
                .filter(order -> !"CANCELLED".equals(order.getOrderStatus()))
                .filter(order -> !"RETURNED".equals(order.getOrderStatus()))
                .toList();
    }

    private List<Order> validRevenueOrders(LocalDate from, LocalDate to) {
        return validRevenueOrders().stream()
                .filter(order -> inRange(order, from, to))
                .toList();
    }

    private boolean inRange(Order order, LocalDate from, LocalDate to) {
        if (order.getCreatedAt() == null) {
            return false;
        }
        LocalDate date = order.getCreatedAt().toLocalDate();
        return (from == null || !date.isBefore(from)) && (to == null || !date.isAfter(to));
    }

    private double estimateCost(OrderItem item) {
        return item.getCostAtSale() * item.getQuantity();
    }

    private static class TopAccumulator {
        private final String productId;
        private final String productName;
        private int quantity;
        private double revenue;

        private TopAccumulator(String productId, String productName) {
            this.productId = productId;
            this.productName = productName;
        }

        private int getQuantity() {
            return quantity;
        }
    }
}
