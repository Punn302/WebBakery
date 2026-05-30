package com.example.hebekery.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class UpdateUserRequest {
    @NotBlank(message = "Ho ten khong duoc de trong")
    private String name;

    @Pattern(regexp = "^$|^[0-9]{10,11}$", message = "So dien thoai khong hop le")
    private String phone;

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
