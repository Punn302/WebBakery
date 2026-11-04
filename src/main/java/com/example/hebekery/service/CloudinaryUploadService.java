package com.example.hebekery.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.hebekery.dto.UploadResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Service
public class CloudinaryUploadService implements UploadService {

    private static final Logger log = LoggerFactory.getLogger(CloudinaryUploadService.class);
    private static final long MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("jpg", "jpeg", "png", "webp", "gif");

    private final Cloudinary cloudinary;

    @Value("${cloudinary.cloud-name:}")
    private String cloudName;

    public CloudinaryUploadService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    @Override
    public UploadResponse uploadImage(MultipartFile file, String folder) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Vui lòng chọn file ảnh để tải lên");
        }
        if (file.getSize() > MAX_IMAGE_SIZE_BYTES) {
            throw new IllegalArgumentException("Ảnh không được vượt quá 5MB");
        }
        String originalFilename = file.getOriginalFilename() == null ? "" : file.getOriginalFilename();
        String extension = extensionOf(originalFilename);
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new IllegalArgumentException("Chỉ hỗ trợ định dạng ảnh jpg, jpeg, png, webp, gif");
        }

        String targetFolder = (folder != null && !folder.isBlank()) ? folder : "hebekery/products";

        if (cloudName == null || cloudName.isBlank() || "your_cloud_name".equalsIgnoreCase(cloudName.trim())) {
            log.warn("Cloudinary credentials chưa được cấu hình. Trả về thông báo yêu cầu cấu hình CLOUDINARY_CLOUD_NAME.");
            throw new IllegalStateException("Cổng lưu trữ Cloudinary chưa được cấu hình biến môi trường");
        }

        try {
            Map<?, ?> uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", targetFolder,
                            "resource_type", "image",
                            "overwrite", true
                    )
            );

            String secureUrl = (String) uploadResult.get("secure_url");
            String publicId = (String) uploadResult.get("public_id");
            String format = (String) uploadResult.get("format");
            long bytes = uploadResult.get("bytes") instanceof Number ? ((Number) uploadResult.get("bytes")).longValue() : file.getSize();

            return new UploadResponse(secureUrl, publicId, format, bytes);
        } catch (IOException ex) {
            log.error("Lỗi khi tải ảnh lên Cloudinary", ex);
            throw new IllegalStateException("Không thể tải ảnh lên dịch vụ Cloudinary: " + ex.getMessage());
        }
    }

    @Override
    public void deleteImage(String publicIdOrUrl) {
        if (publicIdOrUrl == null || publicIdOrUrl.isBlank()) {
            return;
        }
        if (cloudName == null || cloudName.isBlank() || "your_cloud_name".equalsIgnoreCase(cloudName.trim())) {
            return;
        }
        try {
            String publicId = extractPublicId(publicIdOrUrl);
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        } catch (Exception ex) {
            log.warn("Không thể xóa ảnh trên Cloudinary: {}", publicIdOrUrl, ex);
        }
    }

    private String extensionOf(String filename) {
        int dotIndex = filename.lastIndexOf('.');
        if (dotIndex < 0 || dotIndex == filename.length() - 1) {
            throw new IllegalArgumentException("File ảnh phải có phần mở rộng");
        }
        return filename.substring(dotIndex + 1).toLowerCase(Locale.ROOT);
    }

    private String extractPublicId(String publicIdOrUrl) {
        if (!publicIdOrUrl.contains("/")) {
            return publicIdOrUrl;
        }
        int uploadIndex = publicIdOrUrl.indexOf("/upload/");
        if (uploadIndex != -1) {
            String path = publicIdOrUrl.substring(uploadIndex + 8);
            if (path.startsWith("v") && path.indexOf('/') != -1) {
                path = path.substring(path.indexOf('/') + 1);
            }
            int dotIndex = path.lastIndexOf('.');
            return dotIndex != -1 ? path.substring(0, dotIndex) : path;
        }
        return publicIdOrUrl;
    }
}
