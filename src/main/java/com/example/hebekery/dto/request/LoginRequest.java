package com.example.hebekery.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Yêu cầu đăng nhập tài khoản")
public class LoginRequest {

    @Schema(description = "Địa chỉ email đã đăng ký", example = "khachhang@hebekery.vn")
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    private String email;

    @Schema(description = "Mật khẩu tài khoản", example = "123456")
    @NotBlank(message = "Mật khẩu không được để trống")
    private String password;

    @Schema(description = "Ghi nhớ trạng thái đăng nhập", example = "false")
    private boolean rememberMe;

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public boolean isRememberMe() {
        return rememberMe;
    }

    public void setRememberMe(boolean rememberMe) {
        this.rememberMe = rememberMe;
    }
}
