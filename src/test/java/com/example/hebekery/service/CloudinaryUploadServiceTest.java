package com.example.hebekery.service;

import com.cloudinary.Cloudinary;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;

class CloudinaryUploadServiceTest {

    private CloudinaryUploadService uploadService;

    @BeforeEach
    void setUp() {
        Cloudinary cloudinary = mock(Cloudinary.class);
        uploadService = new CloudinaryUploadService(cloudinary);
    }

    @Test
    @DisplayName("Ném ngoại lệ khi file upload rỗng hoặc null")
    void testUploadEmptyFile() {
        MockMultipartFile emptyFile = new MockMultipartFile("file", "test.jpg", "image/jpeg", new byte[0]);
        assertThrows(IllegalArgumentException.class, () -> uploadService.uploadImage(emptyFile, "hebekery/products"));
        assertThrows(IllegalArgumentException.class, () -> uploadService.uploadImage(null, "hebekery/products"));
    }

    @Test
    @DisplayName("Ném ngoại lệ khi định dạng file không được hỗ trợ")
    void testUploadInvalidExtension() {
        MockMultipartFile exeFile = new MockMultipartFile("file", "malicious.exe", "application/octet-stream", new byte[100]);
        assertThrows(IllegalArgumentException.class, () -> uploadService.uploadImage(exeFile, "hebekery/products"));
    }
}
