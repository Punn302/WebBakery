package com.example.hebekery.repository;

import com.example.hebekery.model.ContactMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContactMessageRepository extends JpaRepository<ContactMessage, String> {
    Page<ContactMessage> findByNameContainingIgnoreCaseOrEmailContainingIgnoreCaseOrSubjectContainingIgnoreCaseOrStatusContainingIgnoreCase(
            String name,
            String email,
            String subject,
            String status,
            Pageable pageable
    );
}
