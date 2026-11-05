package com.example.hebekery.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Schema(description = "Yêu cầu đăng ký tài khoản khách hàng mới")
public class RegisterRequest {

    @Schema(description = "Địa chỉ email đăng ký", example = "khachmoi@gmail.com")
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    private String email;

    @Schema(description = "Mật khẩu bảo mật (tối thiểu 6 ký tự)", example = "matkhau123")
    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 6, message = "Mật khẩu phải có ít nhất 6 ký tự")
    private String password;

    @Schema(description = "Họ và tên khách hàng", example = "Trần Thị Mai")
    @NotBlank(message = "Họ tên không được để trống")
    private String name;

    @Schema(description = "Số điện thoại liên lạc", example = "0912345678")
    @Pattern(regexp = "^$|^[0-9]{10,11}$", message = "Số điện thoại không hợp lệ")
    private String phone;

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
