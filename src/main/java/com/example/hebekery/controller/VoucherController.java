package com.example.hebekery.controller;

import com.example.hebekery.dto.ApiResponse;
import com.example.hebekery.dto.VoucherCalculationResponse;
import com.example.hebekery.dto.VoucherResponse;
import com.example.hebekery.dto.request.ApplyVoucherRequest;
import com.example.hebekery.model.User;
import com.example.hebekery.service.UserService;
import com.example.hebekery.service.VoucherService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vouchers")
@Tag(name = "Voucher", description = "Các API kiểm tra và áp dụng mã giảm giá cho khách hàng")
public class VoucherController {

    private final VoucherService voucherService;
    private final UserService userService;

    public VoucherController(VoucherService voucherService, UserService userService) {
        this.voucherService = voucherService;
        this.userService = userService;
    }

    @Operation(summary = "Lấy danh sách mã giảm giá đang khả dụng", description = "Trả về danh sách các voucher Hebekery đang trong thời hạn và còn lượt dùng")
    @GetMapping("/available")
    public ResponseEntity<ApiResponse<List<VoucherResponse>>> getAvailableVouchers() {
        List<VoucherResponse> vouchers = voucherService.getAvailableVouchers();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách voucher thành công", vouchers));
    }

    @Operation(summary = "Kiểm tra và tính toán giảm giá của voucher", description = "Kiểm tra mã voucher, số tiền đơn hàng tối thiểu và tính số tiền được giảm")
    @PostMapping("/apply")
    public ResponseEntity<ApiResponse<VoucherCalculationResponse>> applyVoucher(@Valid @RequestBody ApplyVoucherRequest request) {
        User currentUser = userService.getCurrentUser();
        String userId = currentUser != null ? currentUser.getId() : null;

        VoucherCalculationResponse result = voucherService.validateAndCalculate(
                request.getCode(),
                request.getOrderAmount(),
                userId
        );

        if (!result.isValid()) {
            return ResponseEntity.badRequest().body(ApiResponse.failure(result.getMessage()));
        }

        return ResponseEntity.ok(ApiResponse.success(result.getMessage(), result));
    }
}
