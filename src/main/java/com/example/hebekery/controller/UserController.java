package com.example.hebekery.controller;

import com.example.hebekery.dto.ApiResponse;
import com.example.hebekery.dto.OrderResponse;
import com.example.hebekery.dto.UserResponse;
import com.example.hebekery.dto.UserStatusResponse;
import com.example.hebekery.dto.request.ChangePasswordRequest;
import com.example.hebekery.dto.request.LoginRequest;
import com.example.hebekery.dto.request.RegisterRequest;
import com.example.hebekery.dto.request.UpdateUserRequest;
import com.example.hebekery.model.User;
import com.example.hebekery.service.CartService;
import com.example.hebekery.service.OrderService;
import com.example.hebekery.service.UserService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.List;

@RestController
public class UserController {

    private final UserService userService;
    private final OrderService orderService;
    private final CartService cartService;

    public UserController(UserService userService, OrderService orderService, CartService cartService) {
        this.userService = userService;
        this.orderService = orderService;
        this.cartService = cartService;
    }

    @GetMapping("/api/user/status")
    public ResponseEntity<ApiResponse<UserStatusResponse>> getUserStatus() {
        boolean loggedIn = userService.isLoggedIn();
        UserResponse user = loggedIn ? UserResponse.from(userService.getCurrentUser()) : null;
        UserStatusResponse status = new UserStatusResponse(loggedIn, user);
        return ResponseEntity.ok(ApiResponse.success("Lấy trạng thái người dùng thành công", status));
    }

    @PostMapping("/api/user/login")
    public ResponseEntity<ApiResponse<UserResponse>> login(@Valid @RequestBody LoginRequest request, HttpSession session) {
        User authenticatedUser = userService.login(request.getEmail(), request.getPassword());
        if (authenticatedUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.failure("Email hoặc mật khẩu không đúng"));
        }

        UserResponse user = UserResponse.from(authenticatedUser);
        try {
            cartService.mergeSessionCartForUser(authenticatedUser);
            if (session != null) {
                session.setAttribute("user", user);
            }
        } catch (Exception ignored) {
        }

        return ResponseEntity.ok(ApiResponse.success("Đăng nhập thành công", user));
    }

    @PostMapping("/api/user/register")
    public ResponseEntity<ApiResponse<Void>> register(@Valid @RequestBody RegisterRequest request) {
        boolean registerSuccess = userService.register(
                request.getEmail(),
                request.getPassword(),
                request.getName(),
                request.getPhone()
        );

        if (!registerSuccess) {
            return ResponseEntity.badRequest().body(ApiResponse.failure("Email đã được đăng ký"));
        }
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Đăng ký tài khoản thành công", null));
    }

    @PostMapping("/api/user/logout")
    public ResponseEntity<ApiResponse<Void>> logout(HttpSession session) {
        userService.logoutUser();
        if (session != null) {
            session.removeAttribute("pendingMomoCheckout");
        }
        return ResponseEntity.ok(ApiResponse.success("Đăng xuất thành công", null));
    }

    @PostMapping("/api/admin/logout")
    public ResponseEntity<ApiResponse<Void>> adminLogout() {
        userService.logoutAdmin();
        return ResponseEntity.ok(ApiResponse.success("Đăng xuất admin thành công", null));
    }

    @GetMapping("/logout")
    public void logoutPage(HttpSession session, HttpServletResponse response) throws IOException {
        userService.logoutUser();
        if (session != null) {
            session.removeAttribute("pendingMomoCheckout");
        }
        response.sendRedirect("/");
    }

    @PostMapping("/api/user/update")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(@Valid @RequestBody UpdateUserRequest request, HttpSession session) {
        User updated = userService.updateCurrentUser(request.getName(), request.getPhone());
        UserResponse user = UserResponse.from(updated);
        if (session != null) {
            session.setAttribute("user", user);
        }
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thông tin thành công", user));
    }

    @PutMapping("/api/user/profile")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(@Valid @RequestBody UpdateUserRequest request) {
        User updated = userService.updateCurrentUser(request.getName(), request.getPhone());
        return ResponseEntity.ok(ApiResponse.success("Cập nhật hồ sơ thành công", UserResponse.from(updated)));
    }

    @PostMapping("/api/user/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        boolean changeSuccess = userService.changePassword(request.getCurrentPassword(), request.getNewPassword());
        if (!changeSuccess) {
            return ResponseEntity.badRequest().body(ApiResponse.failure("Mật khẩu hiện tại không đúng"));
        }
        return ResponseEntity.ok(ApiResponse.success("Đổi mật khẩu thành công", null));
    }

    @GetMapping("/api/user/orders")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getUserOrders() {
        if (!userService.isLoggedIn() || userService.getCurrentUser() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.failure("Vui lòng đăng nhập để xem lịch sử đơn hàng"));
        }
        List<OrderResponse> orders = orderService.getOrdersByUser(userService.getCurrentUser().getId());
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách đơn hàng thành công", orders));
    }
}
