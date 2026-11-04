package com.example.hebekery.service;

import com.example.hebekery.dto.UploadResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileStorageService {
    private static final Logger log = LoggerFactory.getLogger(FileStorageService.class);
    private final UploadService uploadService;

    public FileStorageService(UploadService uploadService) {
        this.uploadService = uploadService;
    }

    public String saveProductImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return null;
        }
        try {
            UploadResponse uploadResponse = uploadService.uploadImage(file, "hebekery/products");
            return uploadResponse.getUrl();
        } catch (Exception ex) {
            log.error("Không thể lưu ảnh qua UploadService: {}", ex.getMessage());
            throw ex;
        }
    }

    public void deleteProductImage(String imageUrl) {
        if (imageUrl == null || imageUrl.isBlank()) {
            return;
        }
        uploadService.deleteImage(imageUrl);
    }
}
