package com.example.hebekery.dto;

import com.example.hebekery.model.User;

public class UserResponse {
    private String id;
    private String email;
    private String name;
    private String phone;
    private String role;
    private boolean active;
    private boolean forcePasswordChange;

    public UserResponse() {
    }

    public UserResponse(String id, String email, String name, String phone, String role, boolean active, boolean forcePasswordChange) {
        this.id = id;
        this.email = email;
        this.name = name;
        this.phone = phone;
        this.role = role;
        this.active = active;
        this.forcePasswordChange = forcePasswordChange;
    }

    public static UserResponse from(User user) {
        if (user == null) {
            return null;
        }
        return new UserResponse(user.getId(), user.getEmail(), user.getName(), user.getPhone(), user.getRole(), user.isActive(), user.isForcePasswordChange());
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public boolean isForcePasswordChange() {
        return forcePasswordChange;
    }

    public void setForcePasswordChange(boolean forcePasswordChange) {
        this.forcePasswordChange = forcePasswordChange;
    }
}
