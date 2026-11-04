package com.example.hebekery.controller;

import com.example.hebekery.dto.ApiResponse;
import com.example.hebekery.dto.ContactResponse;
import com.example.hebekery.dto.request.ContactRequest;
import com.example.hebekery.model.ContactMessage;
import com.example.hebekery.service.ContactService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/contact")
public class ContactController {

    private final ContactService contactService;

    public ContactController(ContactService contactService) {
        this.contactService = contactService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ContactResponse>> submitContact(@Valid @RequestBody ContactRequest request) {
        ContactMessage saved = contactService.save(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi sớm nhất có thể.", ContactResponse.from(saved)));
    }
}
