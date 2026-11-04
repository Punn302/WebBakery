package com.example.hebekery.service;

import com.example.hebekery.dto.UploadResponse;
import org.springframework.web.multipart.MultipartFile;

public interface UploadService {
    UploadResponse uploadImage(MultipartFile file, String folder);
    void deleteImage(String publicIdOrUrl);
}
