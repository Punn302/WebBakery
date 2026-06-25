package com.example.hebekery.service;

import com.example.hebekery.model.User;
import com.example.hebekery.repository.UserRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    public static final String DEFAULT_CUSTOMER_PASSWORD = "123456";
    public static final String USER_AUTH = "USER_AUTH";
    public static final String ADMIN_AUTH = "ADMIN_AUTH";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User login(String email, String password) {
        Optional<User> user = userRepository.findByEmailIgnoreCase(email);
        if (user.isEmpty() || !user.get().isActive() || !passwordMatches(password, user.get().getPassword())) {
            return null;
        }

        User authenticatedUser = upgradePasswordIfNeeded(user.get(), password);
        authenticatedUser.setLoggedIn(true);
        HttpSession session = currentSession(true);
        if (isAdminRole(authenticatedUser)) {
            session.setAttribute(ADMIN_AUTH, authenticatedUser);
        } else {
            session.setAttribute(USER_AUTH, authenticatedUser);
        }
        return authenticatedUser;
    }

    public void logout() {
        logoutUser();
    }

    public void logoutUser() {
        HttpSession session = currentSession(false);
        if (session == null) {
            return;
        }
        User currentUser = getCurrentUser();
        if (currentUser != null) {
            currentUser.setLoggedIn(false);
        }
        session.removeAttribute(USER_AUTH);
        session.removeAttribute("user");
    }

    public void logoutAdmin() {
        HttpSession session = currentSession(false);
        if (session == null) {
            return;
        }
        User currentAdmin = getCurrentAdmin();
        if (currentAdmin != null) {
            currentAdmin.setLoggedIn(false);
        }
        session.removeAttribute(ADMIN_AUTH);
    }

    public User getCurrentUser() {
        return getSessionUser(USER_AUTH);
    }

    public User getCurrentAdmin() {
        return getSessionUser(ADMIN_AUTH);
    }

    public boolean isLoggedIn() {
        User currentUser = getCurrentUser();
        return currentUser != null && currentUser.isLoggedIn();
    }

    public boolean isAdmin() {
        User currentAdmin = getCurrentAdmin();
        return currentAdmin != null && currentAdmin.isLoggedIn() && isAdminRole(currentAdmin);
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
        User user = findById(id).orElseThrow(() -> new IllegalArgumentException("Không tìm thấy user"));
        if (!"USER".equalsIgnoreCase(user.getRole())) {
            throw new IllegalArgumentException("Chỉ reset mật khẩu mặc định cho tài khoản khách");
        }
        user.setPassword(passwordEncoder.encode(DEFAULT_CUSTOMER_PASSWORD));
        user.setForcePasswordChange(true);
        return userRepository.save(user);
    }

    public User updateCurrentUser(String name, String phone) {
        if (!isLoggedIn()) {
            throw new IllegalStateException("Vui lòng đăng nhập");
        }

        User currentUser = getCurrentUser();
        currentUser.setName(name);
        currentUser.setPhone(phone);
        currentUser = userRepository.save(currentUser);
        currentUser.setLoggedIn(true);
        currentSession(true).setAttribute(USER_AUTH, currentUser);
        return currentUser;
    }

    public boolean changePassword(String currentPassword, String newPassword) {
        if (!isLoggedIn()) {
            throw new IllegalStateException("Vui lòng đăng nhập");
        }

        User currentUser = getCurrentUser();
        if (!passwordMatches(currentPassword, currentUser.getPassword())) {
            return false;
        }

        currentUser.setPassword(passwordEncoder.encode(newPassword));
        currentUser.setForcePasswordChange(false);
        currentUser = userRepository.save(currentUser);
        currentUser.setLoggedIn(true);
        currentSession(true).setAttribute(USER_AUTH, currentUser);
        return true;
    }

    private User getSessionUser(String key) {
        HttpSession session = currentSession(false);
        if (session == null) {
            return null;
        }
        Object value = session.getAttribute(key);
        return value instanceof User user ? user : null;
    }

    private HttpSession currentSession(boolean create) {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes == null) {
            return null;
        }
        return attributes.getRequest().getSession(create);
    }

    private boolean isAdminRole(User user) {
        return user != null && "ADMIN".equalsIgnoreCase(user.getRole());
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