package com.example.hebekery.repository;

import com.example.hebekery.model.VoucherUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VoucherUsageRepository extends JpaRepository<VoucherUsage, String> {

    List<VoucherUsage> findByUserId(String userId);

    long countByVoucherIdAndUserId(String voucherId, String userId);

    boolean existsByVoucherIdAndUserId(String voucherId, String userId);
}
