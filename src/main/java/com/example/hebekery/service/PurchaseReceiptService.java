package com.example.hebekery.service;

import com.example.hebekery.model.Product;
import com.example.hebekery.model.PurchaseReceipt;
import com.example.hebekery.repository.PurchaseReceiptRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class PurchaseReceiptService {
    private final PurchaseReceiptRepository purchaseReceiptRepository;
    private final ProductService productService;

    public PurchaseReceiptService(PurchaseReceiptRepository purchaseReceiptRepository, ProductService productService) {
        this.purchaseReceiptRepository = purchaseReceiptRepository;
        this.productService = productService;
    }

    public PurchaseReceipt create(String productId, String supplier, int quantity, double unitCost, String note) {
        return createBatch(List.of(productId), List.of(quantity), List.of(unitCost), supplier, note).get(0);
    }

    public List<PurchaseReceipt> createBatch(List<String> productIds, List<Integer> quantities, List<Double> unitCosts, String supplier, String note) {
        if (productIds == null || quantities == null || unitCosts == null || productIds.isEmpty()) {
            throw new IllegalArgumentException("Vui long nhap it nhat mot san pham");
        }
        if (productIds.size() != quantities.size() || productIds.size() != unitCosts.size()) {
            throw new IllegalArgumentException("Du lieu phieu nhap khong hop le");
        }

        String receiptCode = "PN-" + System.currentTimeMillis();
        LocalDateTime importedAt = LocalDateTime.now();
        List<PurchaseReceipt> savedReceipts = new ArrayList<>();

        for (int i = 0; i < productIds.size(); i++) {
            String productId = productIds.get(i);
            int quantity = quantities.get(i) == null ? 0 : quantities.get(i);
            double unitCost = unitCosts.get(i) == null ? 0 : unitCosts.get(i);
            savedReceipts.add(createLine(receiptCode, importedAt, productId, supplier, quantity, unitCost, note, i + 1));
        }

        return savedReceipts;
    }

    private PurchaseReceipt createLine(String receiptCode, LocalDateTime importedAt, String productId, String supplier, int quantity, double unitCost, String note, int lineNumber) {
        if (productId == null || productId.isBlank()) {
            throw new IllegalArgumentException("Vui long chon san pham");
        }
        Product product = productService.getProductById(productId);
        if (product == null) {
            throw new IllegalArgumentException("Khong tim thay san pham");
        }
        if (quantity <= 0) {
            throw new IllegalArgumentException("So luong nhap phai lon hon 0");
        }
        if (unitCost < 0) {
            throw new IllegalArgumentException("Don gia nhap khong hop le");
        }
        if (unitCost > product.getPrice()) {
            throw new IllegalArgumentException("Gia nhap cua " + product.getName() + " khong duoc vuot qua gia ban");
        }

        PurchaseReceipt receipt = new PurchaseReceipt();
        receipt.setId(receiptCode + "-" + lineNumber);
        receipt.setReceiptCode(receiptCode);
        receipt.setProductId(product.getId());
        receipt.setProductName(product.getName());
        receipt.setSupplier(supplier == null ? "" : supplier.trim());
        receipt.setQuantity(quantity);
        receipt.setUnitCost(unitCost);
        receipt.setImportedAt(importedAt);
        receipt.setNote(note == null ? "" : note.trim());
        PurchaseReceipt saved = purchaseReceiptRepository.save(receipt);
        productService.receiveStock(productId, quantity, unitCost, "PURCHASE_RECEIPT", receiptCode, "Nhap hang tu phieu " + receiptCode);
        return saved;
    }

    public Page<PurchaseReceipt> search(String keyword, Pageable pageable) {
        return search(keyword, null, null, pageable);
    }

    public Page<PurchaseReceipt> search(String keyword, LocalDate from, LocalDate to, Pageable pageable) {
        return purchaseReceiptRepository.search(
                keyword == null ? "" : keyword.trim(),
                from == null ? null : from.atStartOfDay(),
                to == null ? null : to.plusDays(1).atStartOfDay(),
                pageable
        );
    }

    public List<PurchaseReceipt> getAll() {
        return purchaseReceiptRepository.findAll();
    }

    public List<PurchaseReceipt> getAll(LocalDate from, LocalDate to) {
        if (from == null || to == null) {
            return getAll();
        }
        return purchaseReceiptRepository.findByImportedAtGreaterThanEqualAndImportedAtLessThan(from.atStartOfDay(), to.plusDays(1).atStartOfDay());
    }

    public double getTotalImportCost() {
        return getAll().stream().mapToDouble(PurchaseReceipt::getTotalCost).sum();
    }

    public double getTotalImportCost(LocalDate from, LocalDate to) {
        return getAll(from, to).stream().mapToDouble(PurchaseReceipt::getTotalCost).sum();
    }

    public int getTotalImportedQuantity() {
        return getAll().stream().mapToInt(PurchaseReceipt::getQuantity).sum();
    }

    public int getTotalImportedQuantity(LocalDate from, LocalDate to) {
        return getAll(from, to).stream().mapToInt(PurchaseReceipt::getQuantity).sum();
    }

    public List<PurchaseReceipt> getByReceiptCode(String receiptCode) {
        return purchaseReceiptRepository.findByReceiptCodeOrderByImportedAtAsc(receiptCode);
    }
}
