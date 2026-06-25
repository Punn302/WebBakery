package com.example.hebekery.service;

import com.example.hebekery.dto.TopSellingProduct;
import com.example.hebekery.model.PurchaseReceipt;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.BaseFont;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.util.List;

@Service
public class ReportPdfService {
    private final ReportService reportService;
    private final PurchaseReceiptService purchaseReceiptService;
    private final Font regularFont;
    private final Font titleFont;
    private final Font boldFont;

    public ReportPdfService(ReportService reportService, PurchaseReceiptService purchaseReceiptService) {
        this.reportService = reportService;
        this.purchaseReceiptService = purchaseReceiptService;
        BaseFont baseFont = createBaseFont();
        this.regularFont = new Font(baseFont, 10);
        this.titleFont = new Font(baseFont, 18, Font.BOLD);
        this.boldFont = new Font(baseFont, 10, Font.BOLD);
    }

    public byte[] buildReport(LocalDate from, LocalDate to) {
        try {
            ByteArrayOutputStream output = new ByteArrayOutputStream();
            Document document = new Document(PageSize.A4, 36, 36, 36, 36);
            PdfWriter.getInstance(document, output);
            document.open();

            addTitle(document, "Báo cáo Hebekery", "Từ " + from + " đến " + to);
            addSummary(document, from, to);
            addTopProducts(document, reportService.getTopSellingProducts(from, to));
            addReceipts(document, purchaseReceiptService.getAll(from, to));

            document.close();
            return output.toByteArray();
        } catch (Exception ex) {
            throw new IllegalStateException("Không thể tạo PDF báo cáo", ex);
        }
    }

    private void addTitle(Document document, String title, String subtitle) {
        Paragraph heading = new Paragraph(title, titleFont);
        heading.setAlignment(Element.ALIGN_CENTER);
        document.add(heading);
        Paragraph sub = new Paragraph(subtitle, regularFont);
        sub.setAlignment(Element.ALIGN_CENTER);
        sub.setSpacingAfter(16);
        document.add(sub);
    }

    private void addSummary(Document document, LocalDate from, LocalDate to) {
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        addRow(table, "Doanh thu", money(reportService.getRevenueTotal(from, to)));
        addRow(table, "Lợi nhuận", money(reportService.getProfitTotal(from, to)));
        addRow(table, "Đơn doanh thu", String.valueOf(reportService.getRevenueOrderCount(from, to)));
        addRow(table, "Chi phí nhập", money(reportService.getImportCostTotal(from, to)));
        addRow(table, "Số lượng nhập", String.valueOf(reportService.getImportedQuantityTotal(from, to)));
        document.add(section("Tổng quan"));
        document.add(table);
    }

    private void addTopProducts(Document document, List<TopSellingProduct> products) {
        document.add(section("Top sản phẩm bán chạy"));
        PdfPTable table = new PdfPTable(new float[]{4, 1, 2});
        table.setWidthPercentage(100);
        addHeader(table, "Sản phẩm", "SL", "Doanh thu");
        products.forEach(item -> addRow(table, item.getProductName(), String.valueOf(item.getQuantity()), money(item.getRevenue())));
        document.add(table);
    }

    private void addReceipts(Document document, List<PurchaseReceipt> receipts) {
        document.add(section("Phiếu nhập hàng"));
        PdfPTable table = new PdfPTable(new float[]{2, 4, 1, 2});
        table.setWidthPercentage(100);
        addHeader(table, "Phiếu", "Sản phẩm", "SL", "Tổng nhập");
        receipts.forEach(item -> addRow(table, item.getReceiptCode(), item.getProductName(), String.valueOf(item.getQuantity()), money(item.getTotalCost())));
        document.add(table);
    }

    private Paragraph section(String value) {
        Paragraph paragraph = new Paragraph(value, boldFont);
        paragraph.setSpacingBefore(14);
        paragraph.setSpacingAfter(8);
        return paragraph;
    }

    private void addHeader(PdfPTable table, String... values) {
        for (String value : values) {
            PdfPCell cell = new PdfPCell(new Phrase(value, boldFont));
            cell.setPadding(6);
            table.addCell(cell);
        }
    }

    private void addRow(PdfPTable table, String... values) {
        for (String value : values) {
            PdfPCell cell = new PdfPCell(new Phrase(value == null ? "" : value, regularFont));
            cell.setPadding(6);
            table.addCell(cell);
        }
    }

    private String money(double value) {
        return String.format("%,.0fđ", value).replace(",", ".");
    }

    private BaseFont createBaseFont() {
        try {
            return BaseFont.createFont("C:/Windows/Fonts/arial.ttf", BaseFont.IDENTITY_H, BaseFont.EMBEDDED);
        } catch (Exception ex) {
            try {
                return BaseFont.createFont(BaseFont.HELVETICA, BaseFont.WINANSI, BaseFont.NOT_EMBEDDED);
            } catch (Exception ignored) {
                throw new IllegalStateException("Không thể tải font PDF", ignored);
            }
        }
    }
}
