package com.example.hebekery.repository;

import com.example.hebekery.model.PaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, String> {

    Optional<PaymentTransaction> findByReferenceCode(String referenceCode);

    boolean existsByReferenceCode(String referenceCode);

    List<PaymentTransaction> findByOrderId(String orderId);
}
