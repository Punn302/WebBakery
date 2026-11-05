package com.example.hebekery.controller;

import com.example.hebekery.dto.ApiResponse;
import com.example.hebekery.dto.UserResponse;
import com.example.hebekery.dto.request.AdminUserUpdateRequest;
import com.example.hebekery.model.User;
import com.example.hebekery.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "Admin User Management", description = "Quản lý danh sách người dùng, vai trò và trạng thái tài khoản")
public class AdminUserController {

    private final UserService userService;

    public AdminUserController(UserService userService) {
        this.userService = userService;
    }

    @Operation(summary = "Tìm kiếm người dùng quản trị", description = "Lấy danh sách người dùng phân trang theo từ khóa tên hoặc email (yêu cầu quyền ADMIN)", security = @SecurityRequirement(name = "BearerAuth"))
    @GetMapping
    public ResponseEntity<ApiResponse<Page<UserResponse>>> searchUsers(
            @Parameter(description = "Từ khóa tìm kiếm") @RequestParam(defaultValue = "") String keyword,
            @Parameter(description = "Số thứ tự trang") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Số người dùng trên mỗi trang") @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), size, Sort.by("name").ascending());
        Page<User> usersPage = userService.searchUsers(keyword, pageable);
        Page<UserResponse> dtoPage = usersPage.map(UserResponse::from);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách người dùng thành công", dtoPage));
    }

    @Operation(summary = "Xem thông tin người dùng", description = "Lấy chi tiết hồ sơ tài khoản theo mã ID (yêu cầu quyền ADMIN)", security = @SecurityRequirement(name = "BearerAuth"))
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(
            @Parameter(description = "Mã định danh người dùng") @PathVariable String id) {
        User user = userService.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng với mã: " + id));
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin người dùng thành công", UserResponse.from(user)));
    }

    @Operation(summary = "Cập nhật hồ sơ người dùng", description = "Cập nhật vai trò, trạng thái active hoặc reset mật khẩu mặc định (yêu cầu quyền ADMIN)", security = @SecurityRequirement(name = "BearerAuth"))
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @Parameter(description = "Mã định danh người dùng") @PathVariable String id,
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

    @Operation(summary = "Thay đổi vai trò người dùng", description = "Đổi vai trò giữa ADMIN, STAFF_WAREHOUSE, STAFF_SALES, USER (yêu cầu quyền ADMIN)", security = @SecurityRequirement(name = "BearerAuth"))
    @PutMapping("/{id}/role")
    public ResponseEntity<ApiResponse<UserResponse>> updateUserRole(
            @Parameter(description = "Mã định danh người dùng") @PathVariable String id,
            @RequestBody Map<String, String> payload) {
        String role = payload.get("role");
        if (role == null || role.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.failure("Vai trò không được để trống"));
        }
        User updated = userService.updateUserRole(id, role.trim().toUpperCase());
        return ResponseEntity.ok(ApiResponse.success("Cập nhật vai trò thành công", UserResponse.from(updated)));
    }

    @Operation(summary = "Khóa hoặc kích hoạt tài khoản", description = "Chuyển đổi trạng thái hoạt động active của người dùng (yêu cầu quyền ADMIN)", security = @SecurityRequirement(name = "BearerAuth"))
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<UserResponse>> updateUserStatus(
            @Parameter(description = "Mã định danh người dùng") @PathVariable String id,
            @RequestBody Map<String, Boolean> payload) {
        Boolean active = payload.get("active");
        if (active == null) {
            return ResponseEntity.badRequest().body(ApiResponse.failure("Trạng thái active không được để trống"));
        }
        User updated = userService.setUserActive(id, active);
        String msg = active ? "Kích hoạt tài khoản thành công" : "Khóa tài khoản thành công";
        return ResponseEntity.ok(ApiResponse.success(msg, UserResponse.from(updated)));
    }

    @Operation(summary = "Đặt lại mật khẩu cho tài khoản", description = "Reset mật khẩu người dùng về mật khẩu mới hoặc mặc định 123456 (yêu cầu quyền ADMIN)", security = @SecurityRequirement(name = "BearerAuth"))
    @PostMapping("/{id}/reset-password")
    public ResponseEntity<ApiResponse<UserResponse>> resetPassword(
            @Parameter(description = "Mã định danh người dùng") @PathVariable String id,
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
