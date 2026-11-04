package com.example.hebekery.controller;

import com.example.hebekery.model.Product;
import com.example.hebekery.service.ContactService;
import com.example.hebekery.service.FileStorageService;
import com.example.hebekery.service.OrderService;
import com.example.hebekery.service.ProductService;
import com.example.hebekery.service.PurchaseReceiptService;
import com.example.hebekery.service.ReportPdfService;
import com.example.hebekery.service.ReportService;
import com.example.hebekery.service.UserService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

@Controller
public class AdminController {

    private final UserService userService;
    private final OrderService orderService;
    private final ProductService productService;
    private final ContactService contactService;
    private final FileStorageService fileStorageService;
    private final PurchaseReceiptService purchaseReceiptService;
    private final ReportService reportService;
    private final ReportPdfService reportPdfService;

    public AdminController(UserService userService,
                           OrderService orderService,
                           ProductService productService,
                           ContactService contactService,
                           FileStorageService fileStorageService,
                           PurchaseReceiptService purchaseReceiptService,
                           ReportService reportService,
                           ReportPdfService reportPdfService) {
        this.userService = userService;
        this.orderService = orderService;
        this.productService = productService;
        this.contactService = contactService;
        this.fileStorageService = fileStorageService;
        this.purchaseReceiptService = purchaseReceiptService;
        this.reportService = reportService;
        this.reportPdfService = reportPdfService;
    }

    @GetMapping("/admin")
    public String dashboard(@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
                            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
                            Model model) {
        requireAdminPage();
        LocalDate reportFrom = from == null ? LocalDate.now().minusDays(6) : from;
        LocalDate reportTo = to == null ? LocalDate.now() : to;
        model.addAttribute("userCount", userService.getAllUsers().size());
        model.addAttribute("orderCount", orderService.getAllOrders().size());
        model.addAttribute("productCount", productService.getAllProducts().size());
        model.addAttribute("contactCount", contactService.getAll().size());
        model.addAttribute("revenueTotal", reportService.getRevenueTotal(reportFrom, reportTo));
        model.addAttribute("revenueOrderCount", reportService.getRevenueOrderCount(reportFrom, reportTo));
        model.addAttribute("cancelledOrderCount", reportService.getCancelledOrderCount(reportFrom, reportTo));
        model.addAttribute("weeklyRevenue", reportService.getRevenueTrend(reportFrom, reportTo));
        model.addAttribute("from", reportFrom);
        model.addAttribute("to", reportTo);
        model.addAttribute("lowStockProducts", productService.getLowStockProducts());
        return "admin/dashboard";
    }

    @GetMapping("/admin/users")
    public String usersPage(@RequestParam(defaultValue = "") String keyword, @RequestParam(defaultValue = "0") int page, Model model) {
        requireAdminPage();
        Pageable pageable = PageRequest.of(Math.max(page, 0), 8, Sort.by("name").ascending());
        model.addAttribute("page", userService.searchUsers(keyword, pageable));
        model.addAttribute("keyword", keyword);
        return "admin/users";
    }

    @PostMapping("/admin/users/{id}/update")
    public String updateUserForm(@PathVariable String id, @RequestParam String role,
                                 @RequestParam(defaultValue = "false") boolean active,
                                 @RequestParam(defaultValue = "false") boolean resetDefaultPassword) {
        requireAdminPage();
        if (resetDefaultPassword) {
            userService.resetCustomerPasswordToDefault(id);
        }
        userService.updateUserRole(id, role);
        userService.setUserActive(id, active);
        return "redirect:/admin/users";
    }

    @GetMapping("/admin/products")
    public String productsPage(@RequestParam(defaultValue = "") String keyword, @RequestParam(defaultValue = "0") int page, Model model) {
        requireAdminPage();
        Pageable pageable = PageRequest.of(Math.max(page, 0), 8, Sort.by("id").ascending());
        model.addAttribute("page", productService.searchProducts(keyword, pageable));
        model.addAttribute("keyword", keyword);
        model.addAttribute("product", new Product());
        model.addAttribute("categories", productService.getAllCategories());
        return "admin/products";
    }

    @GetMapping("/admin/products/{id}/edit")
    public String editProductPage(@PathVariable String id, Model model) {
        requireAdminPage();
        Product product = productService.getProductById(id);
        if (product == null) {
            return "redirect:/admin/products";
        }
        model.addAttribute("product", product);
        model.addAttribute("categories", productService.getAllCategories());
        return "admin/product-form";
    }

    @PostMapping("/admin/products")
    public String saveProductForm(@ModelAttribute Product product, @RequestParam(required = false) MultipartFile imageFile) {
        requireAdminPage();
        Product existing = product.getId() == null || product.getId().isBlank() ? null : productService.getProductById(product.getId());
        String oldImageUrl = existing == null ? null : existing.getImageUrl();
        String uploadedImage = fileStorageService.saveProductImage(imageFile);
        if (uploadedImage != null) {
            product.setImageUrl(uploadedImage);
        } else if (product.getId() != null && !product.getId().isBlank()) {
            if (existing != null && (product.getImageUrl() == null || product.getImageUrl().isBlank())) {
                product.setImageUrl(existing.getImageUrl());
            }
        }
        if (existing != null) {
            product.setStockQuantity(existing.getStockQuantity());
            product.setAverageCost(existing.getAverageCost());
            product.setLowStockThreshold(existing.getLowStockThreshold());
        }
        productService.saveProduct(product);
        if (uploadedImage != null && oldImageUrl != null && !oldImageUrl.equals(uploadedImage)) {
            fileStorageService.deleteProductImage(oldImageUrl);
        }
        return "redirect:/admin/products";
    }

    @PostMapping("/admin/products/{id}/delete")
    public String deleteProductForm(@PathVariable String id) {
        requireAdminPage();
        productService.deleteProduct(id);
        return "redirect:/admin/products";
    }

    @GetMapping("/admin/products/{id}/preview")
    public String productPreviewPage(@PathVariable String id, Model model) {
        requireAdminPage();
        Product product = productService.getProductById(id);
        if (product == null) {
            return "redirect:/admin/products";
        }
        model.addAttribute("product", product);
        return "admin/product-preview";
    }

    @GetMapping("/admin/orders")
    public String ordersPage(@RequestParam(defaultValue = "") String keyword,
                             @RequestParam(defaultValue = "") String orderStatus,
                             @RequestParam(defaultValue = "") String paymentMethod,
                             @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
                             @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
                             @RequestParam(defaultValue = "0") int page,
                             Model model) {
        requireAdminPage();
        Pageable pageable = PageRequest.of(Math.max(page, 0), 8, Sort.by("createdAt").descending());
        model.addAttribute("page", orderService.searchOrders(keyword, orderStatus, paymentMethod, from, to, pageable));
        model.addAttribute("keyword", keyword);
        model.addAttribute("orderStatus", orderStatus);
        model.addAttribute("paymentMethod", paymentMethod);
        model.addAttribute("from", from);
        model.addAttribute("to", to);
        return "admin/orders";
    }

    @PostMapping("/admin/orders/{id}/status")
    public String updateOrderStatusForm(@PathVariable String id, @RequestParam String orderStatus, @RequestParam String paymentStatus) {
        requireAdminPage();
        orderService.updateStatus(id, orderStatus, paymentStatus);
        return "redirect:/admin/orders/" + id;
    }

    @GetMapping("/admin/orders/{id}")
    public String orderDetailPage(@PathVariable String id, Model model) {
        requireAdminPage();
        model.addAttribute("order", orderService.getOrderById(id));
        model.addAttribute("history", orderService.getHistory(id));
        model.addAttribute("returnHistory", orderService.getReturnHistory(id));
        return "admin/order-detail";
    }

    @PostMapping("/admin/orders/{id}/note")
    public String updateOrderNoteForm(@PathVariable String id, @RequestParam(required = false) String adminNote) {
        requireAdminPage();
        orderService.updateAdminNote(id, adminNote);
        return "redirect:/admin/orders/" + id;
    }

    @PostMapping("/admin/orders/{id}/shipping")
    public String updateOrderShippingForm(@PathVariable String id,
                                          @RequestParam(defaultValue = "") String shippingCarrier,
                                          @RequestParam(defaultValue = "") String trackingCode) {
        requireAdminPage();
        orderService.updateShippingInfo(id, shippingCarrier, trackingCode);
        return "redirect:/admin/orders/" + id;
    }

    @GetMapping("/admin/orders/{id}/invoice")
    public String orderInvoicePage(@PathVariable String id, Model model) {
        requireAdminPage();
        model.addAttribute("order", orderService.getOrderById(id));
        return "admin/order-invoice-print";
    }

    @PostMapping("/admin/orders/{id}/return")
    public String reviewReturnForm(@PathVariable String id, @RequestParam String decision, @RequestParam(required = false) String adminNote) {
        requireAdminPage();
        orderService.reviewReturn(id, decision, adminNote);
        return "redirect:/admin/orders/" + id;
    }

    @GetMapping("/admin/contacts")
    public String contactsPage(@RequestParam(defaultValue = "") String keyword, @RequestParam(defaultValue = "0") int page, Model model) {
        requireAdminPage();
        Pageable pageable = PageRequest.of(Math.max(page, 0), 8, Sort.by("createdAt").descending());
        model.addAttribute("page", contactService.search(keyword, pageable));
        model.addAttribute("keyword", keyword);
        return "admin/contacts";
    }

    @PostMapping("/admin/contacts/{id}/status")
    public String updateContactStatusForm(@PathVariable String id, @RequestParam String status) {
        requireAdminPage();
        contactService.updateStatus(id, status);
        return "redirect:/admin/contacts";
    }

    @GetMapping("/admin/reports")
    public String reportsPage(@RequestParam(defaultValue = "") String keyword,
                              @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
                              @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
                              @RequestParam(defaultValue = "0") int page,
                              Model model) {
        requireAdminPage();
        LocalDate reportFrom = from == null ? LocalDate.now().minusDays(29) : from;
        LocalDate reportTo = to == null ? LocalDate.now() : to;
        Pageable pageable = PageRequest.of(Math.max(page, 0), 8, Sort.by("importedAt").descending());
        model.addAttribute("page", purchaseReceiptService.search(keyword, reportFrom, reportTo, pageable));
        model.addAttribute("keyword", keyword);
        model.addAttribute("from", reportFrom);
        model.addAttribute("to", reportTo);
        model.addAttribute("products", productService.getAllProducts());
        model.addAttribute("revenueTotal", reportService.getRevenueTotal(reportFrom, reportTo));
        model.addAttribute("revenueOrderCount", reportService.getRevenueOrderCount(reportFrom, reportTo));
        model.addAttribute("cancelledOrderCount", reportService.getCancelledOrderCount(reportFrom, reportTo));
        model.addAttribute("importCostTotal", reportService.getImportCostTotal(reportFrom, reportTo));
        model.addAttribute("importedQuantityTotal", reportService.getImportedQuantityTotal(reportFrom, reportTo));
        model.addAttribute("profitTotal", reportService.getProfitTotal(reportFrom, reportTo));
        model.addAttribute("topSellingProducts", reportService.getTopSellingProducts(reportFrom, reportTo));
        model.addAttribute("weeklyRevenue", reportService.getRevenueTrend(reportFrom, reportTo));
        return "admin/reports";
    }

    @PostMapping("/admin/reports/imports")
    public String createPurchaseReceipt(@RequestParam("productId") List<String> productIds,
                                        @RequestParam(defaultValue = "") String supplier,
                                        @RequestParam("quantity") List<Integer> quantities,
                                        @RequestParam("unitCost") List<Double> unitCosts,
                                        @RequestParam(defaultValue = "") String note) {
        requireAdminPage();
        purchaseReceiptService.createBatch(productIds, quantities, unitCosts, supplier, note);
        return "redirect:/admin/reports";
    }

    @GetMapping("/admin/reports/imports/{receiptCode}/print")
    public String printPurchaseReceipt(@PathVariable String receiptCode, Model model) {
        requireAdminPage();
        var receipts = purchaseReceiptService.getByReceiptCode(receiptCode);
        model.addAttribute("receiptCode", receiptCode);
        model.addAttribute("receipts", receipts);
        model.addAttribute("totalCost", receipts.stream().mapToDouble(com.example.hebekery.model.PurchaseReceipt::getTotalCost).sum());
        model.addAttribute("totalQuantity", receipts.stream().mapToInt(com.example.hebekery.model.PurchaseReceipt::getQuantity).sum());
        return "admin/purchase-receipt-print";
    }

    @GetMapping("/admin/reports/print")
    public String printReport(@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
                              @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
                              Model model) {
        requireAdminPage();
        LocalDate reportFrom = from == null ? LocalDate.now().minusDays(29) : from;
        LocalDate reportTo = to == null ? LocalDate.now() : to;
        model.addAttribute("from", reportFrom);
        model.addAttribute("to", reportTo);
        model.addAttribute("revenueTotal", reportService.getRevenueTotal(reportFrom, reportTo));
        model.addAttribute("revenueOrderCount", reportService.getRevenueOrderCount(reportFrom, reportTo));
        model.addAttribute("cancelledOrderCount", reportService.getCancelledOrderCount(reportFrom, reportTo));
        model.addAttribute("importCostTotal", reportService.getImportCostTotal(reportFrom, reportTo));
        model.addAttribute("importedQuantityTotal", reportService.getImportedQuantityTotal(reportFrom, reportTo));
        model.addAttribute("profitTotal", reportService.getProfitTotal(reportFrom, reportTo));
        model.addAttribute("weeklyRevenue", reportService.getRevenueTrend(reportFrom, reportTo));
        model.addAttribute("topSellingProducts", reportService.getTopSellingProducts(reportFrom, reportTo));
        model.addAttribute("receipts", purchaseReceiptService.getAll(reportFrom, reportTo));
        return "admin/report-print";
    }

    @GetMapping(value = "/admin/reports/export.csv", produces = "text/csv; charset=UTF-8")
    @ResponseBody
    public String exportReportCsv(@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
                                  @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        requireAdminPage();
        LocalDate reportFrom = from == null ? LocalDate.now().minusDays(29) : from;
        LocalDate reportTo = to == null ? LocalDate.now() : to;
        StringBuilder csv = new StringBuilder();
        csv.append('\ufeff');
        csv.append("Chi tieu,Gia tri\n");
        csv.append("Tu ngay,").append(reportFrom).append('\n');
        csv.append("Den ngay,").append(reportTo).append('\n');
        csv.append("Doanh thu,").append((long) reportService.getRevenueTotal(reportFrom, reportTo)).append('\n');
        csv.append("Loi nhuan uoc tinh,").append((long) reportService.getProfitTotal(reportFrom, reportTo)).append('\n');
        csv.append("Chi phi nhap,").append((long) reportService.getImportCostTotal(reportFrom, reportTo)).append('\n');
        csv.append("\nTop san pham,So luong,Doanh thu\n");
        reportService.getTopSellingProducts(reportFrom, reportTo).forEach(item ->
                csv.append(csvValue(item.getProductName())).append(',')
                        .append(item.getQuantity()).append(',')
                        .append((long) item.getRevenue()).append('\n')
        );
        csv.append("\nPhieu nhap,San pham,Nha cung cap,So luong,Tong nhap,Ngay\n");
        purchaseReceiptService.getAll(reportFrom, reportTo).forEach(receipt ->
                csv.append(csvValue(receipt.getReceiptCode())).append(',')
                        .append(csvValue(receipt.getProductName())).append(',')
                        .append(csvValue(receipt.getSupplier())).append(',')
                        .append(receipt.getQuantity()).append(',')
                        .append((long) receipt.getTotalCost()).append(',')
                        .append(receipt.getImportedAt()).append('\n')
        );
        return csv.toString();
    }

    @GetMapping("/admin/reports/export.pdf")
    public ResponseEntity<byte[]> exportReportPdf(@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
                                                  @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        requireAdminPage();
        LocalDate reportFrom = from == null ? LocalDate.now().minusDays(29) : from;
        LocalDate reportTo = to == null ? LocalDate.now() : to;
        byte[] pdf = reportPdfService.buildReport(reportFrom, reportTo);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=hebekery-report.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/admin/inventory")
    public String inventoryPage(@RequestParam(defaultValue = "") String keyword, @RequestParam(defaultValue = "0") int page, Model model) {
        requireAdminPage();
        Pageable pageable = PageRequest.of(Math.max(page, 0), 10, Sort.by("name").ascending());
        model.addAttribute("page", productService.searchProducts(keyword, pageable));
        model.addAttribute("keyword", keyword);
        return "admin/inventory";
    }

    @PostMapping("/admin/inventory/{id}/threshold")
    public String updateInventoryThreshold(@PathVariable String id, @RequestParam(defaultValue = "0") int lowStockThreshold) {
        requireAdminPage();
        productService.updateLowStockThreshold(id, lowStockThreshold);
        return "redirect:/admin/inventory";
    }

    private void requireAdminPage() {
        if (!userService.isAdmin()) {
            throw new IllegalStateException("Ban can dang nhap bang tai khoan admin");
        }
    }

    private String csvValue(String value) {
        String safe = value == null ? "" : value.replace("\"", "\"\"");
        return "\"" + safe + "\"";
    }
}
