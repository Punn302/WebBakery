package com.example.hebekery.controller;

import com.example.hebekery.dto.ApiResponse;
import com.example.hebekery.dto.RevenueReportResponse;
import com.example.hebekery.dto.TopSellingProduct;
import com.example.hebekery.service.PurchaseReceiptService;
import com.example.hebekery.service.ReportPdfService;
import com.example.hebekery.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/admin/reports")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Reports & Analytics", description = "Báo cáo doanh thu, lợi nhuận gộp và xuất PDF/CSV thống kê")
public class AdminReportController {

    private final ReportService reportService;
    private final ReportPdfService reportPdfService;
    private final PurchaseReceiptService purchaseReceiptService;

    public AdminReportController(ReportService reportService,
                                 ReportPdfService reportPdfService,
                                 PurchaseReceiptService purchaseReceiptService) {
        this.reportService = reportService;
        this.reportPdfService = reportPdfService;
        this.purchaseReceiptService = purchaseReceiptService;
    }

    @Operation(summary = "Xem tổng hợp báo cáo doanh thu & lợi nhuận", description = "Tính toán tổng doanh thu, lợi nhuận, chi phí nhập hàng và biểu đồ tăng trưởng theo khoảng ngày (yêu cầu quyền ADMIN)", security = @SecurityRequirement(name = "BearerAuth"))
    @GetMapping("/revenue")
    public ResponseEntity<ApiResponse<RevenueReportResponse>> getRevenueReport(
            @Parameter(description = "Từ ngày (YYYY-MM-DD)") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @Parameter(description = "Đến ngày (YYYY-MM-DD)") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        LocalDate reportFrom = from == null ? LocalDate.now().minusDays(29) : from;
        LocalDate reportTo = to == null ? LocalDate.now() : to;

        RevenueReportResponse report = new RevenueReportResponse();
        report.setRevenueTotal(reportService.getRevenueTotal(reportFrom, reportTo));
        report.setRevenueOrderCount(reportService.getRevenueOrderCount(reportFrom, reportTo));
        report.setCancelledOrderCount(reportService.getCancelledOrderCount(reportFrom, reportTo));
        report.setImportCostTotal(reportService.getImportCostTotal(reportFrom, reportTo));
        report.setImportedQuantityTotal(reportService.getImportedQuantityTotal(reportFrom, reportTo));
        report.setProfitTotal(reportService.getProfitTotal(reportFrom, reportTo));
        report.setRevenueTrend(reportService.getRevenueTrend(reportFrom, reportTo));
        report.setTopSellingProducts(reportService.getTopSellingProducts(reportFrom, reportTo));

        return ResponseEntity.ok(ApiResponse.success("Lấy báo cáo doanh thu thành công", report));
    }

    @Operation(summary = "Lấy danh sách sản phẩm bán chạy nhất", description = "Top các sản phẩm đạt doanh số và sản lượng cao nhất trong kỳ", security = @SecurityRequirement(name = "BearerAuth"))
    @GetMapping("/top-selling")
    public ResponseEntity<ApiResponse<List<TopSellingProduct>>> getTopSelling(
            @Parameter(description = "Từ ngày (YYYY-MM-DD)") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @Parameter(description = "Đến ngày (YYYY-MM-DD)") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        LocalDate reportFrom = from == null ? LocalDate.now().minusDays(29) : from;
        LocalDate reportTo = to == null ? LocalDate.now() : to;

        List<TopSellingProduct> products = reportService.getTopSellingProducts(reportFrom, reportTo);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách sản phẩm bán chạy thành công", products));
    }

    @Operation(summary = "Xuất báo cáo PDF doanh thu", description = "Tải về file tài liệu PDF tổng kết doanh số và biểu đồ thống kê", security = @SecurityRequirement(name = "BearerAuth"))
    @GetMapping("/export-pdf")
    public ResponseEntity<byte[]> exportPdf(
            @Parameter(description = "Từ ngày (YYYY-MM-DD)") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @Parameter(description = "Đến ngày (YYYY-MM-DD)") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        LocalDate reportFrom = from == null ? LocalDate.now().minusDays(29) : from;
        LocalDate reportTo = to == null ? LocalDate.now() : to;

        byte[] pdf = reportPdfService.buildReport(reportFrom, reportTo);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=hebekery-report.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @Operation(summary = "Xuất báo cáo CSV số liệu", description = "Tải file dữ liệu bảng tính CSV để phân tích nâng cao", security = @SecurityRequirement(name = "BearerAuth"))
    @GetMapping(value = "/export-csv", produces = "text/csv; charset=UTF-8")
    public ResponseEntity<String> exportCsv(
            @Parameter(description = "Từ ngày (YYYY-MM-DD)") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @Parameter(description = "Đến ngày (YYYY-MM-DD)") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        LocalDate reportFrom = from == null ? LocalDate.now().minusDays(29) : from;
        LocalDate reportTo = to == null ? LocalDate.now() : to;

        StringBuilder csv = new StringBuilder();
        csv.append('\ufeff');
        csv.append("Chỉ tiêu,Giá trị\n");
        csv.append("Từ ngày,").append(reportFrom).append('\n');
        csv.append("Đến ngày,").append(reportTo).append('\n');
        csv.append("Doanh thu,").append((long) reportService.getRevenueTotal(reportFrom, reportTo)).append('\n');
        csv.append("Lợi nhuận ước tính,").append((long) reportService.getProfitTotal(reportFrom, reportTo)).append('\n');
        csv.append("Chi phí nhập,").append((long) reportService.getImportCostTotal(reportFrom, reportTo)).append('\n');
        csv.append("\nTop sản phẩm,Số lượng,Doanh thu\n");
        reportService.getTopSellingProducts(reportFrom, reportTo).forEach(item ->
                csv.append(csvValue(item.getProductName())).append(',')
                        .append(item.getQuantity()).append(',')
                        .append((long) item.getRevenue()).append('\n')
        );
        csv.append("\nPhiếu nhập,Sản phẩm,Nhà cung cấp,Số lượng,Tổng nhập,Ngày\n");
        purchaseReceiptService.getAll(reportFrom, reportTo).forEach(receipt ->
                csv.append(csvValue(receipt.getReceiptCode())).append(',')
                        .append(csvValue(receipt.getProductName())).append(',')
                        .append(csvValue(receipt.getSupplier())).append(',')
                        .append(receipt.getQuantity()).append(',')
                        .append((long) receipt.getTotalCost()).append(',')
                        .append(receipt.getImportedAt()).append('\n')
        );

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=hebekery-report.csv")
                .header(HttpHeaders.CONTENT_TYPE, "text/csv; charset=UTF-8")
                .body(csv.toString());
    }

    private String csvValue(String value) {
        String safe = value == null ? "" : value.replace("\"", "\"\"");
        return "\"" + safe + "\"";
    }
}
