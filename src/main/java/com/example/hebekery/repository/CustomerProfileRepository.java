package com.example.hebekery.repository;

import com.example.hebekery.model.CustomerProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomerProfileRepository extends JpaRepository<CustomerProfile, String> {

    Optional<CustomerProfile> findByUserId(String userId);

    boolean existsByUserId(String userId);
}
