package com.example.hebekery.dto;

import com.example.hebekery.model.User;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Thông tin chi tiết người dùng")
public class UserResponse {

    @Schema(description = "Mã định danh người dùng", example = "USR-001")
    private String id;

    @Schema(description = "Địa chỉ email đăng nhập", example = "khachhang@hebekery.vn")
    private String email;

    @Schema(description = "Họ và tên người dùng", example = "Nguyễn Văn A")
    private String name;

    @Schema(description = "Số điện thoại liên lạc", example = "0987654321")
    private String phone;

    @Schema(description = "Vai trò người dùng trong hệ thống (ADMIN, STAFF_WAREHOUSE, STAFF_SALES, USER)", example = "USER")
    private String role;

    @Schema(description = "Trạng thái hoạt động của tài khoản", example = "true")
    private boolean active;

    @Schema(description = "Yêu cầu bắt buộc đổi mật khẩu khi đăng nhập lần đầu", example = "false")
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
        String cleanRole = user.getRole();
        if (cleanRole != null && cleanRole.startsWith("ROLE_")) {
            cleanRole = cleanRole.substring(5);
        }
        return new UserResponse(user.getId(), user.getEmail(), user.getName(), user.getPhone(), cleanRole, user.isActive(), user.isForcePasswordChange());
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
