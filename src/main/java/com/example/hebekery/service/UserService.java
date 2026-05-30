package com.example.hebekery.service;

import com.example.hebekery.model.User;
import org.springframework.stereotype.Service;
import org.springframework.web.context.annotation.SessionScope;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@SessionScope
public class UserService {

    private User currentUser = null;
    private List<User> users = new ArrayList<>();

    public UserService() {
        // Tạo user mẫu
        users.add(new User("1", "user@hebekery.vn", "123456", "Nguyễn Văn A", "0912345678"));
        users.add(new User("2", "admin@hebekery.vn", "admin123", "Admin Hebekery", "0987654321"));
    }

    // Đăng nhập
    public boolean login(String email, String password) {
        Optional<User> user = users.stream()
                .filter(u -> u.getEmail().equals(email) && u.getPassword().equals(password))
                .findFirst();

        if (user.isPresent()) {
            currentUser = user.get();
            currentUser.setLoggedIn(true);
            return true;
        }
        return false;
    }

    // Đăng xuất
    public void logout() {
        if (currentUser != null) {
            currentUser.setLoggedIn(false);
            currentUser = null;
        }
    }

    // Lấy user hiện tại
    public User getCurrentUser() {
        return currentUser;
    }

    // Kiểm tra đã đăng nhập chưa
    public boolean isLoggedIn() {
        return currentUser != null && currentUser.isLoggedIn();
    }
    // Đăng ký tài khoản mới
    public boolean register(String email, String password, String name, String phone) {
        // Check if email already exists
        boolean exists = users.stream().anyMatch(u -> u.getEmail().equals(email));
        if (exists) {
            return false;
        }

        // Create new user
        String newId = String.valueOf(users.size() + 1);
        User newUser = new User(newId, email, password, name, phone);
        users.add(newUser);

        return true;
    }

    public User updateCurrentUser(String name, String phone) {
        if (!isLoggedIn()) {
            throw new IllegalStateException("Vui long dang nhap");
        }

        currentUser.setName(name);
        currentUser.setPhone(phone);
        return currentUser;
    }

    public boolean changePassword(String currentPassword, String newPassword) {
        if (!isLoggedIn()) {
            throw new IllegalStateException("Vui long dang nhap");
        }

        if (!currentUser.getPassword().equals(currentPassword)) {
            return false;
        }

        currentUser.setPassword(newPassword);
        return true;
    }
}
