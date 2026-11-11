package com.example.hebekery.repository;

import com.example.hebekery.model.ProductBatch;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductBatchRepository extends JpaRepository<ProductBatch, String> {

    Optional<ProductBatch> findByBatchCode(String batchCode);

    List<ProductBatch> findByProductIdOrderByExpiryDateAsc(String productId);

    @Query("SELECT b FROM ProductBatch b WHERE b.productId = :productId AND b.currentQuantity > 0 AND b.status != 'EXPIRED' ORDER BY b.expiryDate ASC")
    List<ProductBatch> findAvailableBatchesFEFO(@Param("productId") String productId);

    @Query("SELECT b FROM ProductBatch b WHERE (:productId IS NULL OR b.productId = :productId) " +
           "AND (:status IS NULL OR b.status = :status) " +
           "ORDER BY b.expiryDate ASC")
    Page<ProductBatch> searchBatches(@Param("productId") String productId,
                                     @Param("status") String status,
                                     Pageable pageable);

    @Query("SELECT b FROM ProductBatch b WHERE b.discountPercent > 0 AND b.currentQuantity > 0 AND b.status = 'NEAR_EXPIRY' ORDER BY b.discountPercent DESC")
    List<ProductBatch> findActiveFlashSaleBatches();

    List<ProductBatch> findByExpiryDateBeforeAndStatusNot(LocalDate date, String status);

    List<ProductBatch> findByExpiryDateBetweenAndStatusNot(LocalDate start, LocalDate end, String status);
}
