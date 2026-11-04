package com.example.hebekery.security;

import com.example.hebekery.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenProviderTest {

    private static final String TEST_SECRET = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";
    private static final long ACCESS_EXPIRATION_MS = 3600000; // 1 hour
    private static final long REFRESH_EXPIRATION_MS = 86400000; // 24 hours

    private JwtTokenProvider tokenProvider;

    @BeforeEach
    void setUp() {
        tokenProvider = new JwtTokenProvider(TEST_SECRET, ACCESS_EXPIRATION_MS, REFRESH_EXPIRATION_MS);
    }

    @Test
    @DisplayName("Tạo Access Token từ User và trích xuất đúng Subject, UserId, Role")
    void generateToken_withValidUser_shouldContainExpectedClaims() {
        User user = new User("u-123", "admin@hebekery.vn", "hashedpass", "Admin User", "0901234567", "ROLE_ADMIN");

        String token = tokenProvider.generateToken(user);

        assertNotNull(token);
        assertFalse(token.isBlank());
        assertTrue(tokenProvider.validateToken(token));
        assertEquals("admin@hebekery.vn", tokenProvider.getUsernameFromToken(token));
        assertEquals("u-123", tokenProvider.getUserIdFromToken(token));
        assertEquals("ROLE_ADMIN", tokenProvider.getRoleFromToken(token));
    }

    @Test
    @DisplayName("Validate token hợp lệ trả về true")
    void validateToken_withValidToken_shouldReturnTrue() {
        User user = new User("u-456", "customer@hebekery.vn", "hashedpass", "Customer", "0909888777", "ROLE_USER");
        String token = tokenProvider.generateToken(user);

        boolean isValid = tokenProvider.validateToken(token);

        assertTrue(isValid);
    }

    @Test
    @DisplayName("Validate token bị sửa đổi (tampered) trả về false")
    void validateToken_withTamperedToken_shouldReturnFalse() {
        User user = new User("u-123", "admin@hebekery.vn", "pass", "Admin", "0901234567", "ROLE_ADMIN");
        String token = tokenProvider.generateToken(user);
        String tamperedToken = token + "xyz";

        boolean isValid = tokenProvider.validateToken(tamperedToken);

        assertFalse(isValid);
    }

    @Test
    @DisplayName("Validate token đã hết hạn trả về false")
    void validateToken_withExpiredToken_shouldReturnFalse() {
        // Token hết hạn ngay lập tức (-1000ms)
        JwtTokenProvider expiredProvider = new JwtTokenProvider(TEST_SECRET, -1000, -1000);
        User user = new User("u-123", "expired@hebekery.vn", "pass", "Expired", "0901234567", "ROLE_USER");
        String token = expiredProvider.generateToken(user);

        boolean isValid = tokenProvider.validateToken(token);

        assertFalse(isValid);
    }

    @Test
    @DisplayName("Validate token chuỗi rỗng hoặc rác trả về false")
    void validateToken_withMalformedToken_shouldReturnFalse() {
        assertFalse(tokenProvider.validateToken(null));
        assertFalse(tokenProvider.validateToken(""));
        assertFalse(tokenProvider.validateToken("   "));
        assertFalse(tokenProvider.validateToken("invalid.jwt.token"));
    }

    @Test
    @DisplayName("Tạo Refresh Token chứa đúng Subject")
    void generateRefreshToken_shouldContainRefreshSubject() {
        String username = "customer@hebekery.vn";
        String refreshToken = tokenProvider.generateRefreshToken(username);

        assertNotNull(refreshToken);
        assertTrue(tokenProvider.validateToken(refreshToken));
        assertEquals(username, tokenProvider.getUsernameFromToken(refreshToken));
    }
}
