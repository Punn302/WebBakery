package com.example.hebekery.service;

import com.example.hebekery.model.User;
import com.example.hebekery.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.context.annotation.SessionScope;

import java.util.List;
import java.util.Optional;

@Service
@SessionScope
public class UserService {

    private final UserRepository userRepository;
    private User currentUser = null;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public boolean login(String email, String password) {
        Optional<User> user = userRepository.findByEmailIgnoreCase(email);
        if (user.isPresent() && user.get().isActive() && user.get().getPassword().equals(password)) {
            currentUser = user.get();
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
        User user = new User(String.valueOf(System.currentTimeMillis()), email, password, name, phone, "USER");
        userRepository.save(user);
        return true;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> findById(String id) {
        return userRepository.findById(id);
    }

    public User updateUserRole(String id, String role) {
        User user = findById(id).orElseThrow(() -> new IllegalArgumentException("Khong tim thay user"));
        user.setRole(role);
        return userRepository.save(user);
    }

    public User setUserActive(String id, boolean active) {
        User user = findById(id).orElseThrow(() -> new IllegalArgumentException("Khong tim thay user"));
        user.setActive(active);
        if (!active) {
            user.setLoggedIn(false);
        }
        return userRepository.save(user);
    }

    public User resetPassword(String id, String newPassword) {
        User user = findById(id).orElseThrow(() -> new IllegalArgumentException("Khong tim thay user"));
        user.setPassword(newPassword);
        return userRepository.save(user);
    }

    public User updateCurrentUser(String name, String phone) {
        if (!isLoggedIn()) {
            throw new IllegalStateException("Vui long dang nhap");
        }

        currentUser.setName(name);
        currentUser.setPhone(phone);
        currentUser = userRepository.save(currentUser);
        currentUser.setLoggedIn(true);
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
        currentUser = userRepository.save(currentUser);
        currentUser.setLoggedIn(true);
        return true;
    }
}
