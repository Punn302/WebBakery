package com.example.hebekery.controller;

import com.example.hebekery.dto.request.ContactRequest;
import com.example.hebekery.service.ContactService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
public class ContactController {

    private final ContactService contactService;

    public ContactController(ContactService contactService) {
        this.contactService = contactService;
    }

    @PostMapping("/api/contact")
    public Map<String, Object> submitContact(@Valid @RequestBody ContactRequest request) {
        contactService.save(request);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Cam on ban da lien he. Chung toi se phan hoi som nhat co the.");
        return response;
    }
}
