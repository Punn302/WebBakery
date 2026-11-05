package com.example.hebekery.controller;

import com.example.hebekery.dto.ApiResponse;
import com.example.hebekery.dto.UploadResponse;
import com.example.hebekery.service.UploadService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/upload")
@PreAuthorize("hasAnyRole('ADMIN', 'STAFF_WAREHOUSE')")
@Tag(name = "Media Upload", description = "Tải lên hình ảnh sản phẩm qua Cloudinary CDN")
public class UploadController {

    private final UploadService uploadService;

    public UploadController(UploadService uploadService) {
        this.uploadService = uploadService;
    }

    @Operation(summary = "Tải ảnh sản phẩm lên Cloudinary", description = "Hỗ trợ định dạng PNG, JPG, WEBP tối đa 10MB (yêu cầu quyền ADMIN hoặc STAFF_WAREHOUSE)", security = @SecurityRequirement(name = "BearerAuth"))
    @PostMapping(value = "/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<UploadResponse>> uploadImage(
            @Parameter(description = "File hình ảnh cần tải lên") @RequestParam("file") MultipartFile file,
            @Parameter(description = "Thư mục lưu trữ trên Cloudinary (mặc định: products)") @RequestParam(value = "folder", defaultValue = "products") String folder) {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.failure("Vui lòng chọn file hình ảnh hợp lệ"));
        }

        UploadResponse response = uploadService.uploadImage(file, folder);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tải ảnh lên thành công", response));
    }
}
