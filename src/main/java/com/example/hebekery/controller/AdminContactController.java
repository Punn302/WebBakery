package com.example.hebekery.controller;

import com.example.hebekery.dto.ApiResponse;
import com.example.hebekery.dto.ContactResponse;
import com.example.hebekery.model.ContactMessage;
import com.example.hebekery.service.ContactService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/contacts")
@PreAuthorize("hasAnyRole('ADMIN', 'STAFF_SALES')")
@Tag(name = "Admin Contact Management", description = "Quản lý và xử lý phản hồi liên hệ của khách hàng (dành cho Admin & CSKH)")
public class AdminContactController {

    private final ContactService contactService;

    public AdminContactController(ContactService contactService) {
        this.contactService = contactService;
    }

    @Operation(summary = "Tìm kiếm tin nhắn liên hệ", description = "Lấy danh sách các liên hệ của khách hàng theo từ khóa và phân trang", security = @SecurityRequirement(name = "BearerAuth"))
    @GetMapping
    public ResponseEntity<ApiResponse<Page<ContactResponse>>> searchContacts(
            @Parameter(description = "Từ khóa tìm kiếm theo tên hoặc nội dung") @RequestParam(defaultValue = "") String keyword,
            @Parameter(description = "Số thứ tự trang") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Số tin nhắn trên mỗi trang") @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), size, Sort.by("createdAt").descending());
        Page<ContactMessage> messages = contactService.search(keyword, pageable);
        Page<ContactResponse> dtos = messages.map(ContactResponse::from);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách tin nhắn liên hệ thành công", dtos));
    }

    @Operation(summary = "Cập nhật trạng thái tin nhắn liên hệ", description = "Chuyển trạng thái liên hệ sang RESOLVED hoặc SPAM", security = @SecurityRequirement(name = "BearerAuth"))
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<ContactResponse>> updateStatus(
            @Parameter(description = "Mã tin nhắn") @PathVariable String id,
            @RequestBody Map<String, String> payload) {
        String status = payload.get("status");
        if (status == null || status.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.failure("Trạng thái không được để trống"));
        }
        ContactMessage updated = contactService.updateStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái thành công", ContactResponse.from(updated)));
    }
}
