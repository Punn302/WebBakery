package com.example.hebekery.service;

import com.example.hebekery.model.User;
import com.example.hebekery.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.context.annotation.SessionScope;

import java.util.List;
import java.util.Optional;

@Service
@SessionScope
public class UserService {
    public static final String DEFAULT_CUSTOMER_PASSWORD = "123456";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private User currentUser = null;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public boolean login(String email, String password) {
        Optional<User> user = userRepository.findByEmailIgnoreCase(email);
        if (user.isPresent() && user.get().isActive() && passwordMatches(password, user.get().getPassword())) {
            currentUser = upgradePasswordIfNeeded(user.get(), password);
            currentUser.setLoggedIn(true);
            return true;
        }
        return false;
    }

    public void logout() {
        if (currentUser != null) {
            currentUser.setLoggedIn(false);
            currentUser = null;
        }
    }

    public User getCurrentUser() {
        return currentUser;
    }

    public boolean isLoggedIn() {
        return currentUser != null && currentUser.isLoggedIn();
    }

    public boolean isAdmin() {
        return isLoggedIn() && "ADMIN".equalsIgnoreCase(currentUser.getRole());
    }

    public boolean register(String email, String password, String name, String phone) {
        if (userRepository.existsByEmailIgnoreCase(email)) {
            return false;
        }
        User user = new User(String.valueOf(System.currentTimeMillis()), email, passwordEncoder.encode(password), name, phone, "USER");
        userRepository.save(user);
        return true;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Page<User> searchUsers(String keyword, Pageable pageable) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return userRepository.findAll(pageable);
        }
        String term = keyword.trim();
        return userRepository.findByNameContainingIgnoreCaseOrEmailContainingIgnoreCaseOrPhoneContainingIgnoreCase(term, term, term, pageable);
    }

    public Optional<User> findById(String id) {
        return userRepository.findById(id);
    }

    public User updateUserRole(String id, String role) {
        User user = findById(id).orElseThrow(() -> new IllegalArgumentException("Không tìm thấy user"));
        user.setRole(role);
        return userRepository.save(user);
    }

    public User setUserActive(String id, boolean active) {
        User user = findById(id).orElseThrow(() -> new IllegalArgumentException("Không tìm thấy user"));
        user.setActive(active);
        if (!active) {
            user.setLoggedIn(false);
        }
        return userRepository.save(user);
    }

    public User resetPassword(String id, String newPassword) {
        User user = findById(id).orElseThrow(() -> new IllegalArgumentException("Không tìm thấy user"));
        user.setPassword(passwordEncoder.encode(newPassword));
        return userRepository.save(user);
    }

    public User resetCustomerPasswordToDefault(String id) {
        User user = findById(id).orElseThrow(() -> new IllegalArgumentException("Khong tim thay user"));
        if (!"USER".equalsIgnoreCase(user.getRole())) {
            throw new IllegalArgumentException("Chi reset mat khau mac dinh cho tai khoan khach");
        }
        user.setPassword(passwordEncoder.encode(DEFAULT_CUSTOMER_PASSWORD));
        user.setForcePasswordChange(true);
        return userRepository.save(user);
    }

    public User updateCurrentUser(String name, String phone) {
        if (!isLoggedIn()) {
            throw new IllegalStateException("Vui lòng đăng nhập");
        }

        currentUser.setName(name);
        currentUser.setPhone(phone);
        currentUser = userRepository.save(currentUser);
        currentUser.setLoggedIn(true);
        return currentUser;
    }

    public boolean changePassword(String currentPassword, String newPassword) {
        if (!isLoggedIn()) {
            throw new IllegalStateException("Vui lòng đăng nhập");
        }

        if (!passwordMatches(currentPassword, currentUser.getPassword())) {
            return false;
        }

        currentUser.setPassword(passwordEncoder.encode(newPassword));
        currentUser.setForcePasswordChange(false);
        currentUser = userRepository.save(currentUser);
        currentUser.setLoggedIn(true);
        return true;
    }

    private boolean passwordMatches(String rawPassword, String storedPassword) {
        if (storedPassword == null) {
            return false;
        }
        if (storedPassword.startsWith("$2a$") || storedPassword.startsWith("$2b$") || storedPassword.startsWith("$2y$")) {
            return passwordEncoder.matches(rawPassword, storedPassword);
        }
        return storedPassword.equals(rawPassword);
    }

    private User upgradePasswordIfNeeded(User user, String rawPassword) {
        String storedPassword = user.getPassword();
        if (storedPassword != null && !storedPassword.startsWith("$2a$") && !storedPassword.startsWith("$2b$") && !storedPassword.startsWith("$2y$")) {
            user.setPassword(passwordEncoder.encode(rawPassword));
            return userRepository.save(user);
        }
        return user;
    }
}
