package com.example.hebekery.service;

import com.example.hebekery.dto.BatchStatsResponse;
import com.example.hebekery.dto.ProductBatchRequest;
import com.example.hebekery.dto.ProductBatchResponse;
import com.example.hebekery.model.Product;
import com.example.hebekery.model.ProductBatch;
import com.example.hebekery.repository.ProductBatchRepository;
import com.example.hebekery.repository.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class ProductBatchService {

    private static final Logger log = LoggerFactory.getLogger(ProductBatchService.class);

    private final ProductBatchRepository productBatchRepository;
    private final ProductRepository productRepository;

    public ProductBatchService(ProductBatchRepository productBatchRepository,
                               ProductRepository productRepository) {
        this.productBatchRepository = productBatchRepository;
        this.productRepository = productRepository;
    }

    @Transactional
    public ProductBatchResponse createBatch(ProductBatchRequest request) {
        if (request.getExpiryDate().isBefore(request.getManufactureDate())) {
            throw new IllegalArgumentException("Hạn sử dụng (HSD) không thể trước Ngày sản xuất (NSX)");
        }

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy sản phẩm có mã: " + request.getProductId()));

        String batchCode = request.getBatchCode();
        if (batchCode == null || batchCode.isBlank()) {
            String month = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMM"));
            String prodSlug = request.getProductId().replaceAll("[^A-Za-z0-9]", "");
            batchCode = "LOT-" + month + "-" + prodSlug + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        }

        long days = ChronoUnit.DAYS.between(LocalDate.now(), request.getExpiryDate());
        String initialStatus;
        if (days < 15) {
            initialStatus = "EXPIRED";
        } else if (days <= 30) {
            initialStatus = "NEAR_EXPIRY";
        } else {
            initialStatus = "ACTIVE";
        }

        ProductBatch batch = new ProductBatch();
        batch.setId("BATCH-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        batch.setProductId(request.getProductId());
        batch.setBatchCode(batchCode);
        batch.setManufactureDate(request.getManufactureDate());
        batch.setExpiryDate(request.getExpiryDate());
        batch.setInitialQuantity(request.getInitialQuantity());
        batch.setCurrentQuantity(request.getInitialQuantity());
        batch.setStatus(initialStatus);
        batch.setDiscountPercent(0.0);
        batch.setNote(request.getNote());
        batch.setCreatedAt(LocalDateTime.now());
        batch.setUpdatedAt(LocalDateTime.now());

        ProductBatch saved = productBatchRepository.save(batch);
        log.info("Đã tạo lô bánh mới: Mã {} cho sản phẩm {}, HSD {}, Số lượng {}", batchCode, product.getName(), request.getExpiryDate(), request.getInitialQuantity());
        return ProductBatchResponse.from(saved, product);
    }

    @Transactional
    public ProductBatchResponse updateBatchFlashSale(String batchId, Double discountPercent, String note) {
        ProductBatch batch = productBatchRepository.findById(batchId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy lô bánh có mã: " + batchId));

        batch.setDiscountPercent(discountPercent != null ? discountPercent : 0.0);
        if (note != null && !note.isBlank()) {
            batch.setNote(note);
        }
        batch.setUpdatedAt(LocalDateTime.now());
        ProductBatch saved = productBatchRepository.save(batch);

        Product product = productRepository.findById(saved.getProductId()).orElse(null);
        log.info("Cập nhật Flash Sale lô {}: Giảm {}%", saved.getBatchCode(), saved.getDiscountPercent());
        return ProductBatchResponse.from(saved, product);
    }

    public Page<ProductBatchResponse> searchBatches(String productId, String status, Pageable pageable) {
        String cleanProd = (productId != null && !productId.isBlank()) ? productId.trim() : null;
        String cleanStatus = (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) ? status.trim() : null;

        Page<ProductBatch> page = productBatchRepository.searchBatches(cleanProd, cleanStatus, pageable);
        Map<String, Product> productMap = productRepository.findAll().stream()
                .collect(Collectors.toMap(Product::getId, Function.identity(), (a, b) -> a));

        return page.map(b -> ProductBatchResponse.from(b, productMap.get(b.getProductId())));
    }

    public BatchStatsResponse getBatchStats() {
        List<ProductBatch> all = productBatchRepository.findAll();
        LocalDate now = LocalDate.now();

        long total = all.size();
        long active = 0;
        long nearExpiry = 0;
        long expired = 0;
        long flashSale = 0;

        for (ProductBatch b : all) {
            long days = ChronoUnit.DAYS.between(now, b.getExpiryDate());
            if (days < 15 || "EXPIRED".equalsIgnoreCase(b.getStatus())) {
                expired++;
            } else if (days <= 30 || "NEAR_EXPIRY".equalsIgnoreCase(b.getStatus())) {
                nearExpiry++;
            } else {
                active++;
            }

            if (b.getDiscountPercent() > 0 && b.getCurrentQuantity() > 0 && days >= 15) {
                flashSale++;
            }
        }
        return new BatchStatsResponse(total, active, nearExpiry, expired, flashSale);
    }

    public List<ProductBatchResponse> getActiveFlashSaleBatches() {
        List<ProductBatch> batches = productBatchRepository.findActiveFlashSaleBatches();
        Map<String, Product> productMap = productRepository.findAll().stream()
                .collect(Collectors.toMap(Product::getId, Function.identity(), (a, b) -> a));

        return batches.stream()
                .map(b -> ProductBatchResponse.from(b, productMap.get(b.getProductId())))
                .collect(Collectors.toList());
    }

    @Transactional
    public void deductBatchStockFEFO(String productId, int quantityToDeduct) {
        if (quantityToDeduct <= 0) return;

        List<ProductBatch> batches = productBatchRepository.findAvailableBatchesFEFO(productId);
        int remaining = quantityToDeduct;

        for (ProductBatch batch : batches) {
            if (remaining <= 0) break;

            int available = batch.getCurrentQuantity();
            if (available <= remaining) {
                batch.setCurrentQuantity(0);
                batch.setStatus("SOLD_OUT");
                remaining -= available;
            } else {
                batch.setCurrentQuantity(available - remaining);
                remaining = 0;
            }
            batch.setUpdatedAt(LocalDateTime.now());
            productBatchRepository.save(batch);
            log.info("Xuất kho FEFO lô {}: Còn lại {}", batch.getBatchCode(), batch.getCurrentQuantity());
        }

        if (remaining > 0) {
            log.warn("Sản phẩm {} không đủ tồn kho chi tiết theo lô để trừ toàn bộ (thiếu {} cái)", productId, remaining);
        }
    }
}
