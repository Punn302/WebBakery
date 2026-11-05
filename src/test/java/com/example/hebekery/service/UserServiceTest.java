package com.example.hebekery.service;

import com.example.hebekery.model.User;
import com.example.hebekery.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    @Test
    @DisplayName("testLogin_Success: Đăng nhập thành công với email và mật khẩu chính xác")
    void testLogin_Success() {
        User user = new User("USR-1", "user@test.com", "encoded-pass", "Nguyễn Văn A", "0987654321", "ROLE_USER");
        user.setActive(true);

        when(userRepository.findByEmailIgnoreCase("user@test.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("123456", "encoded-pass")).thenReturn(true);

        User loggedInUser = userService.login("user@test.com", "123456");

        assertNotNull(loggedInUser);
        assertEquals("user@test.com", loggedInUser.getEmail());
        assertTrue(loggedInUser.isLoggedIn());
    }

    @Test
    @DisplayName("testLogin_WrongPassword: Đăng nhập thất bại khi sai mật khẩu")
    void testLogin_WrongPassword() {
        User user = new User("USR-1", "user@test.com", "encoded-pass", "Nguyễn Văn A", "0987654321", "ROLE_USER");
        user.setActive(true);

        when(userRepository.findByEmailIgnoreCase("user@test.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong-pass", "encoded-pass")).thenReturn(false);

        User result = userService.login("user@test.com", "wrong-pass");

        assertNull(result);
    }

    @Test
    @DisplayName("testLogin_InactiveUser: Đăng nhập thất bại khi tài khoản bị khóa")
    void testLogin_InactiveUser() {
        User user = new User("USR-1", "user@test.com", "encoded-pass", "Nguyễn Văn A", "0987654321", "ROLE_USER");
        user.setActive(false);

        when(userRepository.findByEmailIgnoreCase("user@test.com")).thenReturn(Optional.of(user));

        User result = userService.login("user@test.com", "123456");

        assertNull(result);
        verify(passwordEncoder, never()).matches(any(), any());
    }

    @Test
    @DisplayName("testRegister_Success: Đăng ký thành công khi email chưa tồn tại")
    void testRegister_Success() {
        when(userRepository.existsByEmailIgnoreCase("new@test.com")).thenReturn(false);
        when(passwordEncoder.encode("secret")).thenReturn("hashed-secret");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        boolean registered = userService.register("new@test.com", "secret", "Khách Mới", "0911223344");

        assertTrue(registered);
        verify(userRepository).save(argThat(u ->
                "new@test.com".equals(u.getEmail()) &&
                "hashed-secret".equals(u.getPassword()) &&
                "ROLE_USER".equals(u.getRole())
        ));
    }

    @Test
    @DisplayName("testRegister_DuplicateEmail: Đăng ký thất bại khi email đã tồn tại trong hệ thống")
    void testRegister_DuplicateEmail() {
        when(userRepository.existsByEmailIgnoreCase("exist@test.com")).thenReturn(true);

        boolean registered = userService.register("exist@test.com", "secret", "Khách Cũ", "0911223344");

        assertFalse(registered);
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("testUpdateRole: Thay đổi vai trò người dùng thành công")
    void testUpdateRole() {
        User user = new User("USR-1", "user@test.com", "pass", "Nguyễn Văn A", "0987654321", "ROLE_USER");
        when(userRepository.findById("USR-1")).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User updated = userService.updateUserRole("USR-1", "ROLE_ADMIN");

        assertEquals("ROLE_ADMIN", updated.getRole());
        verify(userRepository).save(user);
    }

    @Test
    @DisplayName("testSetUserActive: Khóa tài khoản và đăng xuất người dùng")
    void testSetUserActive() {
        User user = new User("USR-1", "user@test.com", "pass", "Nguyễn Văn A", "0987654321", "ROLE_USER");
        user.setActive(true);
        user.setLoggedIn(true);

        when(userRepository.findById("USR-1")).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User deactivated = userService.setUserActive("USR-1", false);

        assertFalse(deactivated.isActive());
        assertFalse(deactivated.isLoggedIn());
    }

    @Test
    @DisplayName("testResetCustomerPasswordToDefault: Reset mật khẩu mặc định 123456 cho khách hàng")
    void testResetCustomerPasswordToDefault() {
        User user = new User("USR-1", "customer@test.com", "old-pass", "Khách Hàng", "0987654321", "ROLE_USER");
        when(userRepository.findById("USR-1")).thenReturn(Optional.of(user));
        when(passwordEncoder.encode(UserService.DEFAULT_CUSTOMER_PASSWORD)).thenReturn("encoded-default");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User reset = userService.resetCustomerPasswordToDefault("USR-1");

        assertEquals("encoded-default", reset.getPassword());
        assertTrue(reset.isForcePasswordChange());
        verify(userRepository).save(user);
    }

    @Test
    @DisplayName("testResetCustomerPasswordToDefault_NotCustomer: Báo lỗi khi reset mặc định cho tài khoản quản trị")
    void testResetCustomerPasswordToDefault_NotCustomer() {
        User admin = new User("ADM-1", "admin@test.com", "pass", "Quản Trị Viên", "0987654321", "ROLE_ADMIN");
        when(userRepository.findById("ADM-1")).thenReturn(Optional.of(admin));

        assertThrows(IllegalArgumentException.class, () ->
                userService.resetCustomerPasswordToDefault("ADM-1")
        );
        verify(userRepository, never()).save(any(User.class));
    }
}
