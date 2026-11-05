package com.example.hebekery.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.Map;

@Schema(description = "Chuẩn phản hồi chung (Response Wrapper) cho toàn bộ REST API Hebekery")
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    @Schema(description = "Trạng thái thành công của thao tác", example = "true")
    private boolean success;

    @Schema(description = "Thông báo kết quả thao tác", example = "Thao tác thành công")
    private String message;

    @Schema(description = "Dữ liệu phản hồi chính (payload)")
    private T data;

    @Schema(description = "Chi tiết các trường vi phạm tính hợp lệ nếu có lỗi validate", example = "{\"email\": \"Email không hợp lệ\"}")
    private Map<String, String> errors;

    @Schema(description = "Thời điểm trả về phản hồi", example = "2026-11-05T12:00:00")
    private LocalDateTime timestamp = LocalDateTime.now();

    public ApiResponse() {
    }

    public ApiResponse(boolean success, String message, T data) {
        this.success = success;
        this.message = message;
        this.data = data;
        this.timestamp = LocalDateTime.now();
    }

    public ApiResponse(boolean success, String message, T data, Map<String, String> errors) {
        this.success = success;
        this.message = message;
        this.data = data;
        this.errors = errors;
        this.timestamp = LocalDateTime.now();
    }

    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, "Thao tác thành công", data);
    }

    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(true, message, data);
    }

    public static <T> ApiResponse<T> failure(String message) {
        return new ApiResponse<>(false, message, null);
    }

    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(false, message, null);
    }

    public static <T> ApiResponse<T> error(String message, Map<String, String> errors) {
        return new ApiResponse<>(false, message, null, errors);
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
    }

    public Map<String, String> getErrors() {
        return errors;
    }

    public void setErrors(Map<String, String> errors) {
        this.errors = errors;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
