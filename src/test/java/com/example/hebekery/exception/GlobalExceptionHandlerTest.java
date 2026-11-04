package com.example.hebekery.exception;

import com.example.hebekery.dto.ApiResponse;
import io.jsonwebtoken.ExpiredJwtException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.core.MethodParameter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import static org.junit.jupiter.api.Assertions.*;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    @DisplayName("Bắt lỗi MethodArgumentNotValidException trả về 400 kèm chi tiết fields")
    void handleValidation_shouldReturnBadRequestWithErrorsMap() throws NoSuchMethodException {
        BeanPropertyBindingResult bindingResult = new BeanPropertyBindingResult(new Object(), "testObject");
        bindingResult.addError(new FieldError("testObject", "email", "Email không hợp lệ"));
        bindingResult.addError(new FieldError("testObject", "password", "Mật khẩu không được để trống"));

        MethodParameter parameter = new MethodParameter(
                GlobalExceptionHandlerTest.class.getDeclaredMethod("dummyMethod", String.class), 0
        );
        MethodArgumentNotValidException ex = new MethodArgumentNotValidException(parameter, bindingResult);

        ResponseEntity<ApiResponse<Void>> response = handler.handleValidation(ex);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertFalse(response.getBody().isSuccess());
        assertNotNull(response.getBody().getErrors());
        assertEquals("Email không hợp lệ", response.getBody().getErrors().get("email"));
        assertEquals("Mật khẩu không được để trống", response.getBody().getErrors().get("password"));
    }

    @Test
    @DisplayName("Bắt lỗi BadCredentialsException trả về 401 Unauthorized")
    void handleBadCredentials_shouldReturnUnauthorized() {
        BadCredentialsException ex = new BadCredentialsException("Sai mật khẩu");
        ResponseEntity<ApiResponse<Void>> response = handler.handleBadCredentials(ex);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertFalse(response.getBody().isSuccess());
        assertEquals("Email hoặc mật khẩu không chính xác", response.getBody().getMessage());
    }

    @Test
    @DisplayName("Bắt lỗi AccessDeniedException trả về 403 Forbidden")
    void handleAccessDenied_shouldReturnForbidden() {
        AccessDeniedException ex = new AccessDeniedException("Cấm truy cập");
        ResponseEntity<ApiResponse<Void>> response = handler.handleAccessDenied(ex);

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertFalse(response.getBody().isSuccess());
        assertEquals("Bạn không có quyền thực hiện thao tác này", response.getBody().getMessage());
    }

    @Test
    @DisplayName("Bắt lỗi JwtException trả về 401 Unauthorized")
    void handleJwtException_shouldReturnUnauthorized() {
        ExpiredJwtException ex = new ExpiredJwtException(null, null, "Token hết hạn");
        ResponseEntity<ApiResponse<Void>> response = handler.handleJwtException(ex);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertFalse(response.getBody().isSuccess());
        assertEquals("Token xác thực không hợp lệ hoặc đã hết hạn", response.getBody().getMessage());
    }

    @Test
    @DisplayName("Bắt lỗi MaxUploadSizeExceededException trả về 400 Bad Request")
    void handleMaxUploadSize_shouldReturnBadRequest() {
        MaxUploadSizeExceededException ex = new MaxUploadSizeExceededException(5242880);
        ResponseEntity<ApiResponse<Void>> response = handler.handleMaxUploadSize(ex);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertFalse(response.getBody().isSuccess());
        assertTrue(response.getBody().getMessage().contains("Kích thước file"));
    }

    private void dummyMethod(String param) {}
}
