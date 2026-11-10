package com.example.hebekery.service;

import com.example.hebekery.model.User;
import com.example.hebekery.repository.UserRepository;
import com.example.hebekery.security.CustomUserDetails;
import jakarta.servlet.http.HttpSession;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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

        User authenticatedUser = user.get();
        authenticatedUser.setLoggedIn(true);

        // Hỗ trợ session cho luồng legacy tương thích ngược (nếu có ServletRequest)
        HttpSession session = currentSession(false);
        if (session != null) {
            if (isAdminRole(authenticatedUser)) {
                session.setAttribute(ADMIN_AUTH, authenticatedUser);
            } else {
                session.setAttribute(USER_AUTH, authenticatedUser);
            }
        }
        return authenticatedUser;
    }

    public void logout() {
        logoutUser();
    }

    public void logoutUser() {
        SecurityContextHolder.clearContext();
        HttpSession session = currentSession(false);
        if (session != null) {
            session.removeAttribute(USER_AUTH);
            session.removeAttribute("user");
        }
    }

    public void logoutAdmin() {
        SecurityContextHolder.clearContext();
        HttpSession session = currentSession(false);
        if (session != null) {
            session.removeAttribute(ADMIN_AUTH);
        }
    }

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && !(authentication instanceof AnonymousAuthenticationToken)) {
            Object principal = authentication.getPrincipal();
            if (principal instanceof CustomUserDetails customUserDetails) {
                return customUserDetails.getUser();
            }
            if (principal instanceof String email) {
                return userRepository.findByEmailIgnoreCase(email).orElse(null);
            }
        }
        return getSessionUser(USER_AUTH);
    }

    public User getCurrentAdmin() {
        User currentUser = getCurrentUser();
        if (currentUser != null && isAdminRole(currentUser)) {
            return currentUser;
        }
        return getSessionUser(ADMIN_AUTH);
    }

    public boolean isLoggedIn() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && !(authentication instanceof AnonymousAuthenticationToken)) {
            return true;
        }
        User currentUser = getCurrentUser();
        return currentUser != null;
    }

    public boolean isAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && !(authentication instanceof AnonymousAuthenticationToken)) {
            return authentication.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equalsIgnoreCase("ROLE_ADMIN") || a.getAuthority().equalsIgnoreCase("ADMIN"));
        }
        User currentAdmin = getCurrentAdmin();
        return currentAdmin != null && isAdminRole(currentAdmin);
    }

    public boolean register(String email, String password, String name, String phone) {
        if (userRepository.existsByEmailIgnoreCase(email)) {
            return false;
        }
        String cleanPhone = phone != null ? phone.replaceAll("[^0-9]", "") : "";
        if (cleanPhone.startsWith("84") && cleanPhone.length() == 11) {
            cleanPhone = "0" + cleanPhone.substring(2);
        }
        User user = new User(String.valueOf(System.currentTimeMillis()), email.trim().toLowerCase(), passwordEncoder.encode(password), name.trim(), cleanPhone, "ROLE_USER");
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
        User user = findById(id).orElseThrow(() -> new IllegalArgumentException("KhÃ´ng tÃ¬m tháº¥y user"));
        user.setRole(role);
        return userRepository.save(user);
    }

    public User setUserActive(String id, boolean active) {
        User user = findById(id).orElseThrow(() -> new IllegalArgumentException("KhÃ´ng tÃ¬m tháº¥y user"));
        user.setActive(active);
        if (!active) {
            user.setLoggedIn(false);
        }
        return userRepository.save(user);
    }

    public User resetPassword(String id, String newPassword) {
        User user = findById(id).orElseThrow(() -> new IllegalArgumentException("KhÃ´ng tÃ¬m tháº¥y user"));
        user.setPassword(passwordEncoder.encode(newPassword));
        return userRepository.save(user);
    }

    public User resetCustomerPasswordToDefault(String id) {
        User user = findById(id).orElseThrow(() -> new IllegalArgumentException("KhÃ´ng tÃ¬m tháº¥y user"));
        if (!"USER".equalsIgnoreCase(user.getRole()) && !"ROLE_USER".equalsIgnoreCase(user.getRole())) {
            throw new IllegalArgumentException("Chá»‰ reset máº­t kháº©u máº·c Ä‘á»‹nh cho tÃ i khoáº£n khÃ¡ch");
        }
        user.setPassword(passwordEncoder.encode(DEFAULT_CUSTOMER_PASSWORD));
        user.setForcePasswordChange(true);
        return userRepository.save(user);
    }

    public User updateCurrentUser(String name, String phone) {
        User currentUser = getCurrentUser();
        if (currentUser == null) {
            throw new IllegalStateException("Vui lÃ²ng Ä‘Äƒng nháº­p");
        }

        currentUser.setName(name);
        currentUser.setPhone(phone);
        currentUser = userRepository.save(currentUser);

        HttpSession session = currentSession(false);
        if (session != null) {
            session.setAttribute(USER_AUTH, currentUser);
        }
        return currentUser;
    }

    public boolean changePassword(String currentPassword, String newPassword) {
        User currentUser = getCurrentUser();
        if (currentUser == null) {
            throw new IllegalStateException("Vui lÃ²ng Ä‘Äƒng nháº­p");
        }

        if (!passwordMatches(currentPassword, currentUser.getPassword())) {
            return false;
        }

        currentUser.setPassword(passwordEncoder.encode(newPassword));
        currentUser.setForcePasswordChange(false);
        currentUser = userRepository.save(currentUser);

        HttpSession session = currentSession(false);
        if (session != null) {
            session.setAttribute(USER_AUTH, currentUser);
        }
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
        if (user == null || user.getRole() == null) {
            return false;
        }
        String role = user.getRole().trim().toUpperCase();
        return "ADMIN".equals(role) || "ROLE_ADMIN".equals(role);
    }

    private boolean passwordMatches(String rawPassword, String storedPassword) {
        if (storedPassword == null) {
            return false;
        }
        return passwordEncoder.matches(rawPassword, storedPassword);
    }
}
