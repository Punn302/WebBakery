package com.example.hebekery.dto;

import com.example.hebekery.model.User;

public class UserResponse {
    private String id;
    private String email;
    private String name;
    private String phone;

    public UserResponse() {
    }

    public UserResponse(String id, String email, String name, String phone) {
        this.id = id;
        this.email = email;
        this.name = name;
        this.phone = phone;
    }

    public static UserResponse from(User user) {
        if (user == null) {
            return null;
        }
        return new UserResponse(user.getId(), user.getEmail(), user.getName(), user.getPhone());
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
}
