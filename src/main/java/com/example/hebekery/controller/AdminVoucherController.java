package com.example.hebekery.controller;

import com.example.hebekery.dto.ApiResponse;
import com.example.hebekery.dto.VoucherResponse;
import com.example.hebekery.model.Voucher;
import com.example.hebekery.service.AuditLogService;
import com.example.hebekery.service.VoucherService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/vouchers")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Voucher", description = "Các API quản lý mã giảm giá dành cho Quản trị viên")
@SecurityRequirement(name = "BearerAuth")
public class AdminVoucherController {

    private final VoucherService voucherService;
    private final AuditLogService auditLogService;

    public AdminVoucherController(VoucherService voucherService, AuditLogService auditLogService) {
        this.voucherService = voucherService;
        this.auditLogService = auditLogService;
    }

    @Operation(summary = "Lấy toàn bộ danh sách voucher hệ thống")
    @GetMapping
    public ResponseEntity<ApiResponse<List<VoucherResponse>>> getAllVouchers() {
        return ResponseEntity.ok(ApiResponse.success(voucherService.getAllVouchers()));
    }

    @Operation(summary = "Tạo mới voucher khuyến mãi")
    @PostMapping
    public ResponseEntity<ApiResponse<VoucherResponse>> createVoucher(@RequestBody Voucher voucher) {
        Voucher created = voucherService.createVoucher(voucher);
        auditLogService.log("CREATE", "VOUCHER", created.getId(), "Tạo mới voucher: " + created.getCode());
        return ResponseEntity.ok(ApiResponse.success("Tạo mã voucher thành công", VoucherResponse.from(created)));
    }

    @Operation(summary = "Cập nhật voucher")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<VoucherResponse>> updateVoucher(@PathVariable String id, @RequestBody Voucher voucher) {
        Voucher updated = voucherService.updateVoucher(id, voucher);
        auditLogService.log("UPDATE", "VOUCHER", updated.getId(), "Cập nhật voucher: " + updated.getCode());
        return ResponseEntity.ok(ApiResponse.success("Cập nhật voucher thành công", VoucherResponse.from(updated)));
    }

    @Operation(summary = "Xóa voucher")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteVoucher(@PathVariable String id) {
        voucherService.deleteVoucher(id);
        auditLogService.log("DELETE", "VOUCHER", id, "Xóa voucher ID: " + id);
        return ResponseEntity.ok(ApiResponse.success("Xóa voucher thành công", null));
    }
}
