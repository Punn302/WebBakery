package com.example.hebekery.repository;

import com.example.hebekery.model.PurchaseReceipt;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface PurchaseReceiptRepository extends JpaRepository<PurchaseReceipt, String> {
    Page<PurchaseReceipt> findByReceiptCodeContainingIgnoreCaseOrProductNameContainingIgnoreCaseOrSupplierContainingIgnoreCase(
            String receiptCode,
            String productName,
            String supplier,
            Pageable pageable
    );

    List<PurchaseReceipt> findByReceiptCodeOrderByImportedAtAsc(String receiptCode);

    @Query("""
            select r from PurchaseReceipt r
            where (:keyword is null or :keyword = ''
                or lower(r.receiptCode) like lower(concat('%', :keyword, '%'))
                or lower(r.productName) like lower(concat('%', :keyword, '%'))
                or lower(r.supplier) like lower(concat('%', :keyword, '%')))
            and (:dateFrom is null or r.importedAt >= :dateFrom)
            and (:dateTo is null or r.importedAt < :dateTo)
            """)
    Page<PurchaseReceipt> search(
            @Param("keyword") String keyword,
            @Param("dateFrom") LocalDateTime dateFrom,
            @Param("dateTo") LocalDateTime dateTo,
            Pageable pageable
    );

    List<PurchaseReceipt> findByImportedAtGreaterThanEqualAndImportedAtLessThan(LocalDateTime dateFrom, LocalDateTime dateTo);
}
