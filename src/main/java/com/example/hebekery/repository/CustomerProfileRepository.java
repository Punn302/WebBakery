package com.example.hebekery.repository;

import com.example.hebekery.model.CustomerProfile;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomerProfileRepository extends JpaRepository<CustomerProfile, String> {

    Optional<CustomerProfile> findByUserId(String userId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM CustomerProfile p WHERE p.userId = :userId")
    Optional<CustomerProfile> findByUserIdWithLock(@Param("userId") String userId);

    boolean existsByUserId(String userId);
}
