package com.example.hebekery.service;

import com.example.hebekery.dto.request.ContactRequest;
import com.example.hebekery.model.ContactMessage;
import com.example.hebekery.repository.ContactMessageRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ContactService {
    private final ContactMessageRepository contactMessageRepository;

    public ContactService(ContactMessageRepository contactMessageRepository) {
        this.contactMessageRepository = contactMessageRepository;
    }

    public ContactMessage save(ContactRequest request) {
        ContactMessage message = new ContactMessage();
        message.setId("MSG-" + System.currentTimeMillis());
        message.setName(request.getName());
        message.setEmail(request.getEmail());
        message.setPhone(request.getPhone());
        message.setSubject(request.getSubject());
        message.setMessage(request.getMessage());
        message.setStatus("NEW");
        message.setCreatedAt(LocalDateTime.now());
        return contactMessageRepository.save(message);
    }

    public List<ContactMessage> getAll() {
        return contactMessageRepository.findAll();
    }

    public Page<ContactMessage> search(String keyword, Pageable pageable) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return contactMessageRepository.findAll(pageable);
        }
        String term = keyword.trim();
        return contactMessageRepository.findByNameContainingIgnoreCaseOrEmailContainingIgnoreCaseOrSubjectContainingIgnoreCaseOrStatusContainingIgnoreCase(
                term,
                term,
                term,
                term,
                pageable
        );
    }

    public ContactMessage updateStatus(String id, String status) {
        ContactMessage message = contactMessageRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Khong tim thay lien he"));
        message.setStatus(status);
        return contactMessageRepository.save(message);
    }
}
