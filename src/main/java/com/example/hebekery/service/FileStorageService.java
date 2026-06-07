package com.example.hebekery.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
public class FileStorageService {
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("jpg", "jpeg", "png", "webp", "gif");
    private final Path productUploadDir = Path.of("uploads", "products").toAbsolutePath().normalize();

    public String saveProductImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return null;
        }
        String originalName = file.getOriginalFilename() == null ? "" : file.getOriginalFilename();
        String extension = extensionOf(originalName);
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new IllegalArgumentException("Chỉ hỗ trợ ảnh jpg, jpeg, png, webp, gif");
        }
        try {
            Files.createDirectories(productUploadDir);
            String filename = UUID.randomUUID() + "." + extension;
            Path target = productUploadDir.resolve(filename).normalize();
            if (!target.startsWith(productUploadDir)) {
                throw new IllegalArgumentException("Tên file không hợp lệ");
            }
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            return "/uploads/products/" + filename;
        } catch (IOException ex) {
            throw new IllegalStateException("Không thể lưu ảnh sản phẩm");
        }
    }

    private String extensionOf(String filename) {
        int dotIndex = filename.lastIndexOf('.');
        if (dotIndex < 0 || dotIndex == filename.length() - 1) {
            throw new IllegalArgumentException("File ảnh phải có phần mở rộng");
        }
        return filename.substring(dotIndex + 1).toLowerCase(Locale.ROOT);
    }
}
