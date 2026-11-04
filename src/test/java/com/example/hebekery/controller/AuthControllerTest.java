package com.example.hebekery.controller;

import com.example.hebekery.dto.ApiResponse;
import com.example.hebekery.dto.AuthResponse;
import com.example.hebekery.dto.TokenRefreshResponse;
import com.example.hebekery.dto.UserResponse;
import com.example.hebekery.dto.request.LoginRequest;
import com.example.hebekery.dto.request.RefreshTokenRequest;
import com.example.hebekery.dto.request.RegisterRequest;
import com.example.hebekery.model.User;
import com.example.hebekery.repository.UserRepository;
import com.example.hebekery.security.CustomUserDetails;
import com.example.hebekery.security.JwtTokenProvider;
import com.example.hebekery.service.CartService;
import com.example.hebekery.service.UserService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private UserService userService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CartService cartService;

    @InjectMocks
    private AuthController authController;

    @Test
    @DisplayName("Login thành công khi thông tin đăng nhập chính xác")
    void login_success() {
        LoginRequest request = new LoginRequest();
        request.setEmail("user@hebekery.vn");
        request.setPassword("123456");

        User user = new User("u-1", "user@hebekery.vn", "hashedpass", "Nguyen Van A", "0901234567", "ROLE_USER");
        CustomUserDetails userDetails = new CustomUserDetails(user);
        Authentication authentication = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

        when(authenticationManager.authenticate(any())).thenReturn(authentication);
        when(jwtTokenProvider.generateToken(authentication)).thenReturn("mock-access-token");
        when(jwtTokenProvider.generateRefreshToken("user@hebekery.vn")).thenReturn("mock-refresh-token");

        ResponseEntity<ApiResponse<AuthResponse>> response = authController.login(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
        assertEquals("mock-access-token", response.getBody().getData().getAccessToken());
        assertEquals("mock-refresh-token", response.getBody().getData().getRefreshToken());
        assertEquals("user@hebekery.vn", response.getBody().getData().getUser().getEmail());
    }

    @Test
    @DisplayName("Login thất bại (401) khi sai thông tin đăng nhập")
    void login_badCredentials() {
        LoginRequest request = new LoginRequest();
        request.setEmail("user@hebekery.vn");
        request.setPassword("wrongpass");

        when(authenticationManager.authenticate(any())).thenThrow(new BadCredentialsException("Sai mật khẩu"));

        ResponseEntity<ApiResponse<AuthResponse>> response = authController.login(request);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertFalse(response.getBody().isSuccess());
    }

    @Test
    @DisplayName("Đăng ký thành công trả về HTTP 201 Created")
    void register_success() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("newuser@hebekery.vn");
        request.setPassword("password123");
        request.setName("New User");
        request.setPhone("0909999888");

        User created = new User("u-new", "newuser@hebekery.vn", "encodedpass", "New User", "0909999888", "ROLE_USER");

        when(userRepository.existsByEmailIgnoreCase("newuser@hebekery.vn")).thenReturn(false);
        when(userService.register(any(), any(), any(), any())).thenReturn(true);
        when(userRepository.findByEmailIgnoreCase("newuser@hebekery.vn")).thenReturn(Optional.of(created));

        ResponseEntity<ApiResponse<UserResponse>> response = authController.register(request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
        assertEquals("newuser@hebekery.vn", response.getBody().getData().getEmail());
    }

    @Test
    @DisplayName("Đăng ký thất bại khi email đã tồn tại (400 Bad Request)")
    void register_emailExists() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("existing@hebekery.vn");
        request.setPassword("password123");
        request.setName("Existing User");

        when(userRepository.existsByEmailIgnoreCase("existing@hebekery.vn")).thenReturn(true);

        ResponseEntity<ApiResponse<UserResponse>> response = authController.register(request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertFalse(response.getBody().isSuccess());
    }

    @Test
    @DisplayName("Làm mới token thành công khi Refresh Token hợp lệ")
    void refreshToken_success() {
        RefreshTokenRequest request = new RefreshTokenRequest("valid-refresh-token");
        User user = new User("u-1", "user@hebekery.vn", "pass", "User", "0901234567", "ROLE_USER");

        when(jwtTokenProvider.validateToken("valid-refresh-token")).thenReturn(true);
        when(jwtTokenProvider.getUsernameFromToken("valid-refresh-token")).thenReturn("user@hebekery.vn");
        when(userRepository.findByEmailIgnoreCase("user@hebekery.vn")).thenReturn(Optional.of(user));
        when(jwtTokenProvider.generateToken(user)).thenReturn("new-access-token");

        ResponseEntity<ApiResponse<TokenRefreshResponse>> response = authController.refreshToken(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
        assertEquals("new-access-token", response.getBody().getData().getAccessToken());
    }

    @Test
    @DisplayName("Làm mới token thất bại khi Refresh Token không hợp lệ")
    void refreshToken_invalid() {
        RefreshTokenRequest request = new RefreshTokenRequest("invalid-refresh-token");

        when(jwtTokenProvider.validateToken("invalid-refresh-token")).thenReturn(false);

        ResponseEntity<ApiResponse<TokenRefreshResponse>> response = authController.refreshToken(request);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertFalse(response.getBody().isSuccess());
    }

    @Test
    @DisplayName("Lấy thông tin người dùng hiện tại thành công khi đã xác thực")
    void getCurrentUser_whenAuthenticated() {
        User user = new User("u-1", "user@hebekery.vn", "pass", "Nguyen Van A", "0901234567", "ROLE_USER");
        when(userService.getCurrentUser()).thenReturn(user);

        ResponseEntity<ApiResponse<UserResponse>> response = authController.getCurrentUser();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
        assertEquals("user@hebekery.vn", response.getBody().getData().getEmail());
    }
}
