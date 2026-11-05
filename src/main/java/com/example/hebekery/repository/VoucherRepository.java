package com.example.hebekery.repository;

import com.example.hebekery.model.Voucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VoucherRepository extends JpaRepository<Voucher, String> {

    Optional<Voucher> findByCodeIgnoreCaseAndActiveTrue(String code);

    Optional<Voucher> findByCodeIgnoreCase(String code);

    boolean existsByCodeIgnoreCase(String code);
}
