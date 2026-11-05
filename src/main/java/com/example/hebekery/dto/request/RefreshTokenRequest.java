package com.example.hebekery.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Yêu cầu cấp mới access token từ refresh token")
public class RefreshTokenRequest {

    @Schema(description = "Chuỗi refresh token được cấp khi đăng nhập", example = "d9f8e7d6-c5b4-4a3b-8c2d-1e0f9a8b7c6d")
    @NotBlank(message = "Refresh token không được để trống")
    private String refreshToken;

    public RefreshTokenRequest() {
    }

    public RefreshTokenRequest(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }
}
