package com.example.hebekery.controller;

import com.example.hebekery.dto.UserResponse;
import com.example.hebekery.dto.request.ChangePasswordRequest;
import com.example.hebekery.dto.request.LoginRequest;
import com.example.hebekery.dto.request.RegisterRequest;
import com.example.hebekery.dto.request.UpdateUserRequest;
import com.example.hebekery.service.CartService;
import com.example.hebekery.service.OrderService;
import com.example.hebekery.service.UserService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

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
    public Map<String, Object> getUserStatus() {
        Map<String, Object> response = new HashMap<>();
        response.put("loggedIn", userService.isLoggedIn());
        if (userService.isLoggedIn()) {
            response.put("user", UserResponse.from(userService.getCurrentUser()));
        }
        return response;
    }

    @PostMapping("/api/user/login")
    public Map<String, Object> login(@Valid @RequestBody LoginRequest request,
                                     HttpSession session) {
        boolean loginSuccess = userService.login(request.getEmail(), request.getPassword());

        Map<String, Object> response = new HashMap<>();
        response.put("success", loginSuccess);
        if (loginSuccess) {
            UserResponse user = UserResponse.from(userService.getCurrentUser());
            cartService.mergeSessionCartForUser(userService.getCurrentUser());
            String role = user.getRole() == null ? "USER" : user.getRole().trim().toUpperCase();
            session.setAttribute("user", user);

            response.put("user", user);
            if ("ADMIN".equals(role)) {
                response.put("redirectUrl", "/admin");
            } else if (user.isForcePasswordChange()) {
                response.put("redirectUrl", "/profile?forcePasswordChange=true");
            } else {
                response.put("redirectUrl", "/");
            }
            response.put("message", "Đăng nhập thành công");
        } else {
            response.put("message", "Email hoặc mật khẩu không đúng");
        }
        return response;
    }

    @PostMapping("/api/user/register")
    public Map<String, Object> register(@Valid @RequestBody RegisterRequest request) {
        boolean registerSuccess = userService.register(
                request.getEmail(),
                request.getPassword(),
                request.getName(),
                request.getPhone()
        );

        Map<String, Object> response = new HashMap<>();
        response.put("success", registerSuccess);
        response.put("message", registerSuccess ? "Đăng ký thành công" : "Email đã được đăng ký");
        return response;
    }

    @PostMapping("/api/user/logout")
    public Map<String, Object> logout(HttpSession session) {
        clearSession(session);
        return success("Đăng xuất thành công");
    }

    @GetMapping("/logout")
    public void logoutPage(HttpSession session, HttpServletResponse response) throws IOException {
        clearSession(session);
        response.sendRedirect("/login");
    }

    @PostMapping("/api/user/update")
    public Map<String, Object> updateUser(@Valid @RequestBody UpdateUserRequest request, HttpSession session) {
        UserResponse user = UserResponse.from(userService.updateCurrentUser(request.getName(), request.getPhone()));
        session.setAttribute("user", user);

        Map<String, Object> response = success("Cập nhật thông tin thành công");
        response.put("user", user);
        return response;
    }

    @PostMapping("/api/user/change-password")
    public Map<String, Object> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        boolean changeSuccess = userService.changePassword(request.getCurrentPassword(), request.getNewPassword());

        Map<String, Object> response = new HashMap<>();
        response.put("success", changeSuccess);
        response.put("message", changeSuccess ? "Đổi mật khẩu thành công" : "Mật khẩu hiện tại không đúng");
        return response;
    }

    @GetMapping("/api/user/orders")
    public Map<String, Object> getUserOrders() {
        if (!userService.isLoggedIn()) {
            throw new IllegalStateException("Vui lòng đăng nhập");
        }

        Map<String, Object> response = success(null);
        response.put("orders", orderService.getOrdersByUser(userService.getCurrentUser().getId()));
        return response;
    }

    private void clearSession(HttpSession session) {
        userService.logout();
        session.removeAttribute("user");
        session.invalidate();
    }

    private Map<String, Object> success(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        if (message != null) {
            response.put("message", message);
        }
        return response;
    }
}
