package com.example.hebekery.service;

import com.example.hebekery.dto.BatchStatsResponse;
import com.example.hebekery.dto.ProductBatchRequest;
import com.example.hebekery.dto.ProductBatchResponse;
import com.example.hebekery.model.Product;
import com.example.hebekery.model.ProductBatch;
import com.example.hebekery.repository.ProductBatchRepository;
import com.example.hebekery.repository.ProductRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductBatchServiceTest {

    @Mock
    private ProductBatchRepository productBatchRepository;

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private ProductBatchService productBatchService;

    @Test
    @DisplayName("testCreateBatch: Tạo lô bánh mới thành công với trạng thái ACTIVE khi HSD > 30 ngày")
    void testCreateBatch_Active() {
        Product product = new Product("P001", "Bánh Biscotti Nguyên Cám", "Banh", "Mo ta", 65000, "url", "badge");
        when(productRepository.findById("P001")).thenReturn(Optional.of(product));
        when(productBatchRepository.save(any(ProductBatch.class))).thenAnswer(i -> i.getArgument(0));

        ProductBatchRequest request = new ProductBatchRequest();
        request.setProductId("P001");
        request.setBatchCode("LOT-202611-TEST");
        request.setManufactureDate(LocalDate.now().minusDays(5));
        request.setExpiryDate(LocalDate.now().plusDays(90));
        request.setInitialQuantity(50);
        request.setNote("Mẻ bánh nướng thử nghiệm");

        ProductBatchResponse res = productBatchService.createBatch(request);

        assertNotNull(res);
        assertEquals("P001", res.getProductId());
        assertEquals("LOT-202611-TEST", res.getBatchCode());
        assertEquals("ACTIVE", res.getStatus());
        assertEquals("SAFE", res.getAlertLevel());
        assertEquals(50, res.getCurrentQuantity());
    }

    @Test
    @DisplayName("testCreateBatch: Báo lỗi khi HSD trước NSX")
    void testCreateBatch_InvalidDate() {
        ProductBatchRequest request = new ProductBatchRequest();
        request.setProductId("P001");
        request.setManufactureDate(LocalDate.now());
        request.setExpiryDate(LocalDate.now().minusDays(1)); // Expiry before manufacture

        assertThrows(IllegalArgumentException.class, () -> productBatchService.createBatch(request));
        verify(productBatchRepository, never()).save(any());
    }

    @Test
    @DisplayName("testDeductBatchStockFEFO: Trừ kho theo thứ tự First-Expired, First-Out chính xác")
    void testDeductBatchStockFEFO() {
        // Batch 1 expires sooner (in 10 days), has 5 in stock
        ProductBatch b1 = new ProductBatch("B1", "P001", "LOT-01", LocalDate.now().minusDays(40), LocalDate.now().plusDays(10), 20, 5, "NEAR_EXPIRY", 0.0, null);
        // Batch 2 expires later (in 60 days), has 20 in stock
        ProductBatch b2 = new ProductBatch("B2", "P001", "LOT-02", LocalDate.now().minusDays(10), LocalDate.now().plusDays(60), 30, 20, "ACTIVE", 0.0, null);

        when(productBatchRepository.findAvailableBatchesFEFO("P001")).thenReturn(List.of(b1, b2));

        // Deduct 8 items: should take all 5 from B1 (leaving 0, status SOLD_OUT) and 3 from B2 (leaving 17)
        productBatchService.deductBatchStockFEFO("P001", 8);

        assertEquals(0, b1.getCurrentQuantity());
        assertEquals("SOLD_OUT", b1.getStatus());
        assertEquals(17, b2.getCurrentQuantity());

        verify(productBatchRepository, times(1)).save(b1);
        verify(productBatchRepository, times(1)).save(b2);
    }

    @Test
    @DisplayName("testGetBatchStats: Tổng hợp số lượng các lô an toàn, cận date, hết hạn")
    void testGetBatchStats() {
        ProductBatch b1 = new ProductBatch("B1", "P001", "LOT-01", LocalDate.now().minusDays(10), LocalDate.now().plusDays(80), 20, 20, "ACTIVE", 0.0, null);
        ProductBatch b2 = new ProductBatch("B2", "P001", "LOT-02", LocalDate.now().minusDays(50), LocalDate.now().plusDays(20), 20, 15, "NEAR_EXPIRY", 30.0, null);
        ProductBatch b3 = new ProductBatch("B3", "P002", "LOT-03", LocalDate.now().minusDays(90), LocalDate.now().minusDays(5), 10, 5, "EXPIRED", 0.0, null);

        when(productBatchRepository.findAll()).thenReturn(List.of(b1, b2, b3));

        BatchStatsResponse stats = productBatchService.getBatchStats();

        assertNotNull(stats);
        assertEquals(3, stats.getTotalBatches());
        assertEquals(1, stats.getActiveBatches());
        assertEquals(1, stats.getNearExpiryBatches());
        assertEquals(1, stats.getExpiredBatches());
        assertEquals(1, stats.getFlashSaleBatches()); // b2 has discount 30.0%
    }
}
