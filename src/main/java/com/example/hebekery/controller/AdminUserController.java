package com.example.hebekery.controller;

import com.example.hebekery.dto.ApiResponse;
import com.example.hebekery.dto.UserResponse;
import com.example.hebekery.dto.request.AdminUserUpdateRequest;
import com.example.hebekery.model.User;
import com.example.hebekery.service.UserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final UserService userService;

    public AdminUserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<UserResponse>>> searchUsers(
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), size, Sort.by("name").ascending());
        Page<User> usersPage = userService.searchUsers(keyword, pageable);
        Page<UserResponse> dtoPage = usersPage.map(UserResponse::from);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách người dùng thành công", dtoPage));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable String id) {
        User user = userService.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng với mã: " + id));
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin người dùng thành công", UserResponse.from(user)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @PathVariable String id,
            @RequestBody AdminUserUpdateRequest request) {
        if (Boolean.TRUE.equals(request.getResetDefaultPassword())) {
            userService.resetCustomerPasswordToDefault(id);
        }
        if (request.getRole() != null && !request.getRole().isBlank()) {
            userService.updateUserRole(id, request.getRole());
        }
        if (request.getActive() != null) {
            userService.setUserActive(id, request.getActive());
        }
        User updated = userService.findById(id).orElseThrow();
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thông tin người dùng thành công", UserResponse.from(updated)));
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<ApiResponse<UserResponse>> updateUserRole(
            @PathVariable String id,
            @RequestBody Map<String, String> payload) {
        String role = payload.get("role");
        if (role == null || role.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.failure("Vai trò không được để trống"));
        }
        User updated = userService.updateUserRole(id, role.trim().toUpperCase());
        return ResponseEntity.ok(ApiResponse.success("Cập nhật vai trò thành công", UserResponse.from(updated)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<UserResponse>> updateUserStatus(
            @PathVariable String id,
            @RequestBody Map<String, Boolean> payload) {
        Boolean active = payload.get("active");
        if (active == null) {
            return ResponseEntity.badRequest().body(ApiResponse.failure("Trạng thái active không được để trống"));
        }
        User updated = userService.setUserActive(id, active);
        String msg = active ? "Kích hoạt tài khoản thành công" : "Khóa tài khoản thành công";
        return ResponseEntity.ok(ApiResponse.success(msg, UserResponse.from(updated)));
    }

    @PostMapping("/{id}/reset-password")
    public ResponseEntity<ApiResponse<UserResponse>> resetPassword(
            @PathVariable String id,
            @RequestBody(required = false) Map<String, String> payload) {
        String newPassword = payload != null ? payload.get("newPassword") : null;
        User updated;
        if (newPassword != null && !newPassword.isBlank()) {
            updated = userService.resetPassword(id, newPassword);
        } else {
            updated = userService.resetCustomerPasswordToDefault(id);
        }
        return ResponseEntity.ok(ApiResponse.success("Đặt lại mật khẩu thành công", UserResponse.from(updated)));
    }
}
