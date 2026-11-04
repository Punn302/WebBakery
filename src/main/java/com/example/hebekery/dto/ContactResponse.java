package com.example.hebekery.dto;

import com.example.hebekery.model.ContactMessage;

public class ContactResponse {
    private String id;
    private String name;
    private String email;
    private String phone;
    private String subject;
    private String message;
    private String status;
    private String createdAt;

    public ContactResponse() {
    }

    public static ContactResponse from(ContactMessage cm) {
        if (cm == null) {
            return null;
        }
        ContactResponse dto = new ContactResponse();
        dto.setId(cm.getId());
        dto.setName(cm.getName());
        dto.setEmail(cm.getEmail());
        dto.setPhone(cm.getPhone());
        dto.setSubject(cm.getSubject());
        dto.setMessage(cm.getMessage());
        dto.setStatus(cm.getStatus());
        dto.setCreatedAt(cm.getCreatedAt() != null ? cm.getCreatedAt().toString() : null);
        return dto;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }
}
