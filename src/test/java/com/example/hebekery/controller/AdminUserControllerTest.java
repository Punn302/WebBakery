package com.example.hebekery.controller;

import com.example.hebekery.dto.ApiResponse;
import com.example.hebekery.dto.UserResponse;
import com.example.hebekery.model.User;
import com.example.hebekery.service.UserService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminUserControllerTest {

    @Mock
    private UserService userService;

    @InjectMocks
    private AdminUserController adminUserController;

    @Test
    @DisplayName("Tìm kiếm user trả về Page UserResponse")
    void searchUsers_success() {
        User user = new User("u-1", "user@hebekery.vn", "pass", "Nguyen Van A", "0901234567", "ROLE_USER");
        Page<User> page = new PageImpl<>(List.of(user), PageRequest.of(0, 10), 1);

        when(userService.searchUsers(eq("Nguyen"), any())).thenReturn(page);

        ResponseEntity<ApiResponse<Page<UserResponse>>> response = adminUserController.searchUsers("Nguyen", 0, 10);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
        assertEquals(1, response.getBody().getData().getTotalElements());
    }

    @Test
    @DisplayName("Cập nhật quyền user thành công")
    void updateUserRole_success() {
        User updated = new User("u-1", "user@hebekery.vn", "pass", "Nguyen Van A", "0901234567", "ROLE_STAFF_WAREHOUSE");
        when(userService.updateUserRole("u-1", "ROLE_STAFF_WAREHOUSE")).thenReturn(updated);

        ResponseEntity<ApiResponse<UserResponse>> response = adminUserController.updateUserRole("u-1", Map.of("role", "ROLE_STAFF_WAREHOUSE"));

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
        assertEquals("STAFF_WAREHOUSE", response.getBody().getData().getRole());
    }

    @Test
    @DisplayName("Khóa hoặc mở khóa tài khoản user thành công")
    void updateUserStatus_success() {
        User updated = new User("u-1", "user@hebekery.vn", "pass", "Nguyen Van A", "0901234567", "ROLE_USER");
        updated.setActive(false);
        when(userService.setUserActive("u-1", false)).thenReturn(updated);

        ResponseEntity<ApiResponse<UserResponse>> response = adminUserController.updateUserStatus("u-1", Map.of("active", false));

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertFalse(response.getBody().getData().isActive());
    }
}
